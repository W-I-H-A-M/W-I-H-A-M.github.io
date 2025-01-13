// **************************************
// Variable Declarations & DOM References
// **************************************

const rows = 0;
const cols = 0;

const mapContainer = document.getElementById("mapContainer");
const mapGrid = document.getElementById("mapGrid");
const editMapGrid = document.getElementById("editMapGrid");
let resizeTimeout;

// **************************************
// Event Listeners
// **************************************

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    loadSelectedPlace(locationSelect.value);
  }, 300);
});

// **************************************
// Functions
// **************************************

/**
 * Renders the provided place on the map by setting the background
 * image and creating/resizing the grid.
 */
function renderPlace(place) {
  if (!place || !place.background) {
    console.warn("No valid place or background image found:", place);
    mapContainer.style.backgroundImage = "";
    divEditScenario.style.backgroundImage = "";
    return;
  }
  mapContainer.style.backgroundImage = `url(${place.background})`;
  divEditScenario.style.backgroundImage = `url(${place.background})`;
  renderGrid(place.gridSize.rows, place.gridSize.cols);
  resizeGrid(place.gridSize.rows, place.gridSize.cols);
}

/**
 * Creates grid cells for the map (or editable map), placing NPCs and objects
 * according to the current location, time, and scenario edit mode.
 */
function renderGrid(rows, cols) {
  mapGrid.innerHTML = "";
  editMapGrid.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "mapCell";
      cell.dataset.col = c;
      cell.dataset.row = r;

      // NPCs present in this cell
      const npcsHere =
        npcs?.filter(npc =>
          npc.schedule?.some(entry =>
            entry.placeId === currentPlace &&
            entry.row === r &&
            entry.col === c &&
            entry.timeStart === timeline[currentIndex]?.id
          )
        ) || [];

      // Objects present in this cell
      const objectsHere =
        objects?.filter(obj =>
          obj.position &&
          obj.position.type === "place" &&
          obj.position.targetId === currentPlace &&
          obj.position.x === c &&
          obj.position.y === r
        ) || [];

      const symbolElement = document.createElement("span");
      symbolElement.className = "mapElement";

      // Determine which icon to display
      if (npcsHere.length + objectsHere.length > 1) {
        symbolElement.textContent = "📍";
      } else if (npcsHere.length === 1) {
        symbolElement.textContent = "👤";
      } else if (objectsHere.length === 1) {
        symbolElement.textContent = "🔍";
      }

      // Create hover overlay (tooltip) for NPCs or objects
      if (npcsHere.length > 0 || objectsHere.length > 0) {
        const tooltip = document.createElement("div");
        tooltip.className = "hoverOverlay";

        // NPC entries
        npcsHere.forEach(npc => {
          const npcItem = document.createElement("div");
          npcItem.className = "hoverItem";

          const btnNPCItem = document.createElement("div");
          btnNPCItem.className = "hoverItem";

          const img = document.createElement("img");
          img.src = npc.image || "assets/default_npc.png";
          img.alt = npc.name || "(Unnamed NPC)";
          img.className = "hoverImage";

          const name = document.createElement("span");
          name.textContent = npc.name || "(Unnamed NPC)";

          btnNPCItem.appendChild(img);
          btnNPCItem.appendChild(name);
          npcItem.appendChild(btnNPCItem);

          // Remove this NPC if scenario editing is enabled
          if (editScenarioEnabled) {
            const deleteItem = document.createElement("span");
            deleteItem.className = "tooltipBtnRemove";
            deleteItem.textContent = "❌";
            deleteItem.addEventListener("click", (e) => {
              e.stopPropagation();
              npc.schedule = npc.schedule.filter(entry =>
                !(entry.placeId === currentPlace && entry.row === r && entry.col === c)
              );
              loadSelectedPlace(locationSelect.value);
            });
            npcItem.appendChild(deleteItem);
          }
          tooltip.appendChild(npcItem);

          // Click event to show NPC details in the "Selected" tab
          btnNPCItem.addEventListener("click", (e) => {
            e.stopPropagation();
            displaySelectedDetails(npc);
            document.querySelector('.tab-button[data-tab="tabSelected"]').click();
          });
        });

        // Object entries
        objectsHere.forEach(obj => {
          const objectItem = document.createElement("div");
          objectItem.className = "hoverItem";

          const btnObjectItem = document.createElement("div");
          btnObjectItem.className = "hoverItem";

          const img = document.createElement("img");
          img.src = obj.image || "assets/default_object.png";
          img.alt = obj.name || "(Unnamed Object)";
          img.className = "hoverImage";

          const name = document.createElement("span");
          name.textContent = obj.name || "(Unnamed Object)";

          btnObjectItem.appendChild(img);
          btnObjectItem.appendChild(name);
          objectItem.appendChild(btnObjectItem);

          // Remove object position if scenario editing is enabled
          if (editScenarioEnabled) {
            const deleteItem = document.createElement("span");
            deleteItem.className = "tooltipBtnRemove";
            deleteItem.textContent = "❌";
            deleteItem.addEventListener("click", (e) => {
              e.stopPropagation();
              obj.position = null;
              loadSelectedPlace(locationSelect.value);
            });
            objectItem.appendChild(deleteItem);
          }
          tooltip.appendChild(objectItem);

          // Click event to show object details in the "Selected" tab
          btnObjectItem.addEventListener("click", (e) => {
            e.stopPropagation();
            displaySelectedDetails(obj);
            document.querySelector('.tab-button[data-tab="tabSelected"]').click();
          });
        });

        symbolElement.appendChild(tooltip);

        // Dynamic tooltip positioning
        symbolElement.addEventListener("mouseenter", () => {
          const rect = symbolElement.getBoundingClientRect();
          const mapRect = editScenarioEnabled
            ? editMapGrid.getBoundingClientRect()
            : mapGrid.getBoundingClientRect();

          // Check top edge
          if (rect.top - mapRect.top < 50) {
            tooltip.style.top = "100%";
            tooltip.style.bottom = "auto";
          } else {
            tooltip.style.top = "auto";
            tooltip.style.bottom = "100%";
          }

          // Check left edge
          if (rect.left - mapRect.left < 50) {
            tooltip.style.left = "0";
            tooltip.style.transform = "translateX(0)";
          } else if (rect.right > mapRect.right - 50) {
            tooltip.style.left = "auto";
            tooltip.style.right = "0";
            tooltip.style.transform = "translateX(0)";
          } else {
            tooltip.style.left = "50%";
            tooltip.style.right = "auto";
            tooltip.style.transform = "translateX(-50%)";
          }
        });
      }

      cell.appendChild(symbolElement);

      if (editScenarioEnabled) {
        editMapGrid.appendChild(cell);
      } else {
        mapGrid.appendChild(cell);
      }
    }
  }
  if (editScenarioEnabled) {
    enableScenarioDrop();
  }
}

/**
 * Resizes the grid cells so that they fit in the container, maintaining
 * a square layout and accounting for the header space.
 */
function resizeGrid(rows, cols) {
  const containerWidth = editScenarioEnabled ? editMapGrid.clientWidth : mapGrid.clientWidth;
  const containerHeight = Math.min(
    editScenarioEnabled ? editMapGrid.clientHeight : mapGrid.clientHeight,
    window.innerHeight - document.querySelector("header").offsetHeight
  );
  const cellSize = Math.min(containerWidth / cols, containerHeight / rows);
  const finalCellSize = Math.floor(cellSize);

  const targetGrid = editScenarioEnabled ? editMapGrid : mapGrid;
  targetGrid.style.gridTemplateColumns = `repeat(${cols}, ${finalCellSize}px)`;
  targetGrid.style.gridTemplateRows = `repeat(${rows}, ${finalCellSize}px)`;

  // Scale the symbols to match cell size
  const symbols = targetGrid.querySelectorAll(".mapElement");
  symbols.forEach((symbol) => {
    symbol.style.fontSize = `${finalCellSize * 0.7}px`;
    symbol.style.lineHeight = `${finalCellSize}px`;
  });

  // Tooltips do not scale
  const tooltips = targetGrid.querySelectorAll(".hoverOverlay");
  tooltips.forEach((tooltip) => {
    tooltip.style.fontSize = "";
  });
}

/**
 * Locates the place by its ID and calls renderPlace if found.
 */
function loadSelectedPlace(placeId) {
  const place = places.find(p => p.id === placeId);
  if (place) {
    renderPlace(place);
  } else {
    console.log("Place not found:", placeId);
  }
}

/**
 * Displays detailed info about the selected item (NPC or object)
 * in the "Selected" tab, including images, attributes, HP, and inventory.
 */
function displaySelectedDetails(item) {
  const selectedTab = document.getElementById("tabSelected");
  selectedTab.innerHTML = "";

  const charSheet = document.createElement("div");
  charSheet.classList.add("character-sheet");

  const img = document.createElement("img");
  img.src = item.image || item.background || (item.schedule ? "assets/default_npc.png" : "assets/default_object.png");
  img.alt = item.name || "Unnamed";
  img.classList.add("character-image");
  charSheet.appendChild(img);

  const name = document.createElement("h1");
  name.textContent = item.name || "(Unnamed)";
  name.classList.add("character-name");
  charSheet.appendChild(name);

  // If the item has a schedule, treat it as an NPC
  if (item.schedule) {
    const baseAttributes = document.createElement("div");
    baseAttributes.classList.add("base-attributes");

    const fields = [
      { label: "name", value: item.name, i18n: "name" },
      { label: "profession", value: item.profession || "N/N", i18n: "profession" },
      {
        label: "appearance",
        value: item.appearance?.replace(/\n/g, "<br>") || "N/N",
        i18n: "appearance"
      },
      {
        label: "description",
        value: item.description?.replace(/\n/g, "<br>") || "N/N",
        i18n: "description"
      }
    ];

    fields.forEach(field => {
      const fieldDiv = document.createElement("div");
      fieldDiv.classList.add("base-attribute-field");

      const fieldLabel = document.createElement("strong");
      fieldLabel.dataset.i18n = field.i18n;

      const fieldValue = document.createElement("span");
      fieldValue.innerHTML = field.value;

      fieldDiv.appendChild(fieldLabel);
      fieldDiv.appendChild(fieldValue);
      baseAttributes.appendChild(fieldDiv);
    });

    // HP fields
    const hpFields = [
      { label: "currhp", current: "currentHP", max: "maxHP", i18n: "currhp" },
      {
        label: "currentmentalhp",
        current: "currentMentalHP",
        max: "maxMentalHP",
        i18n: "currentmentalhp"
      }
    ];

    hpFields.forEach(hp => {
      const hpDiv = document.createElement("div");
      hpDiv.classList.add("hp-field");

      const hpLabel = document.createElement("strong");
      hpLabel.dataset.i18n = hp.i18n;

      const currentInput = document.createElement("input");
      currentInput.type = "number";
      currentInput.value = item[hp.current] || 0;
      currentInput.classList.add("hp-input");
      currentInput.addEventListener("input", () => {
        item[hp.current] = parseInt(currentInput.value, 10) || 0;
        console.log(`${hp.current} updated:`, item[hp.current]);
      });

      const maxSpan = document.createElement("span");
      maxSpan.textContent = ` / ${item[hp.max] || 0}`;

      hpDiv.appendChild(hpLabel);
      hpDiv.appendChild(currentInput);
      hpDiv.appendChild(maxSpan);
      baseAttributes.appendChild(hpDiv);
    });

    charSheet.appendChild(baseAttributes);

    const attributesSection = document.createElement("div");
    attributesSection.classList.add("attributes-section");

    const attributesTitle = document.createElement("h2");
    attributesTitle.dataset.i18n = "attributes";
    attributesSection.appendChild(attributesTitle);

    const attributesGrid = document.createElement("div");
    attributesGrid.classList.add("attributes-grid");

    const categories = ["Physical", "Knowledge", "Social"];
    categories.forEach(category => {
      const categoryContainer = document.createElement("div");
      categoryContainer.classList.add("attribute-category");

      const powerPoints = item.attributes?.[category]?.powerPoints || 0;
      const bonusPoints = item.attributes?.[category]?.bonusPoints || 0;

      const categoryHeader = document.createElement("h3");
      categoryHeader.innerHTML = `
        <span data-i18n="${category.toLowerCase()}">${category}</span>
        <span class="bonus-points">+ ${bonusPoints}</span>
        <span class="power-points">⚡ ${powerPoints}</span>
      `;
      categoryContainer.appendChild(categoryHeader);

      const attributesList = document.createElement("ul");
      attributesList.classList.add("attributes-list");

      const entries = item.attributes?.[category]?.entries || [];
      entries.forEach(entry => {
        const total = entry.points + bonusPoints;
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name}: ${total}`;
        attributesList.appendChild(listItem);
      });

      if (entries.length === 0) {
        const noAttributesMessage = document.createElement("li");
        noAttributesMessage.textContent = "No attributes available.";
        attributesList.appendChild(noAttributesMessage);
      }

      categoryContainer.appendChild(attributesList);
      attributesGrid.appendChild(categoryContainer);
    });

    attributesSection.appendChild(attributesGrid);
    charSheet.appendChild(attributesSection);
  }

  // If it's not an NPC, treat it as an object
  if (!item.schedule) {
    const objectDetails = document.createElement("div");
    objectDetails.classList.add("object-details");

    const description = document.createElement("p");
    description.innerHTML = item.description?.replace(/\n/g, "<br>") || "No description available.";
    description.classList.add("object-description");
    objectDetails.appendChild(description);

    if (item.position) {
      const ownerDiv = document.createElement("div");
      ownerDiv.classList.add("owner-details");

      if (item.position.type === "npc") {
        const owner = npcs.find(npc => npc.id === item.position.targetId);
        if (owner) {
          const positionTitle = document.createElement("span");
          positionTitle.dataset.i18n = "located_with";
          const card = renderItemCard(owner, "npc");
          ownerDiv.appendChild(positionTitle);
          ownerDiv.appendChild(card);
        }
      } else if (item.position.type === "place") {
        const place = places.find(p => p.id === item.position.targetId);
        if (place) {
          const positionTitle = document.createElement("span");
          positionTitle.dataset.i18n = "located_with";
          const card = renderItemCard(place, "place");
          ownerDiv.appendChild(positionTitle);
          ownerDiv.appendChild(card);
        }
      }
      objectDetails.appendChild(ownerDiv);
    }

    charSheet.appendChild(objectDetails);
  }

  // Inventory for NPCs
  if (item.schedule) {
    const inventorySection = document.createElement("div");
    inventorySection.classList.add("inventory-section");

    const inventoryTitle = document.createElement("h2");
    inventoryTitle.dataset.i18n = "inventory";
    inventorySection.appendChild(inventoryTitle);

    const inventoryContainer = document.createElement("div");
    inventoryContainer.classList.add("inventory-container");

    const npcObjects = objects.filter(
      obj => obj.position?.type === "npc" && obj.position.targetId === item.id
    );

    npcObjects.forEach(obj => {
      const card = renderItemCard(obj, "object");
      inventoryContainer.appendChild(card);
    });

    if (npcObjects.length === 0) {
      const noItemsMessage = document.createElement("div");
      noItemsMessage.dataset.i18n = "no_objects";
      inventoryContainer.appendChild(noItemsMessage);
    }

    inventorySection.appendChild(inventoryContainer);
    charSheet.appendChild(inventorySection);
  }

  selectedTab.appendChild(charSheet);

  // Refresh translations for displayed text
  loadLanguage(currentLanguage, languages);

  // Switch to the "Selected" tab
  document.querySelector('.tab-button[data-tab="tabSelected"]').click();
}
