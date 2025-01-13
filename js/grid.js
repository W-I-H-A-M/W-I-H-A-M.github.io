//grid.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////

// init values
const rows = 0;
const cols = 0;

const mapContainer = document.getElementById("mapContainer");
const mapGrid = document.getElementById("mapGrid");
const editMapGrid = document.getElementById("editMapGrid");

let resizeTimeout;
/////////////////
//Eventlistener//
/////////////////

window.addEventListener("resize", () => {

    clearTimeout(resizeTimeout); // Vorherigen Timer löschen
    resizeTimeout = setTimeout(() => {
        loadSelectedPlace(locationSelect.value);
    }, 300); // Wartezeit in Millisekunden
});

/////////////
//Functions//
/////////////

// set grid size and background image for a place
function renderPlace(place) {
    if (!place || !place.background) {
        console.warn("Kein gültiger Ort oder Hintergrundbild gefunden:", place);
        mapContainer.style.backgroundImage = ""; // Standard-Hintergrund entfernen
        divEditScenario.style.backgroundImage = "";
        return;
    }
    mapContainer.style.backgroundImage = `url(${place.background})`; // Hintergrund setzen
    divEditScenario.style.backgroundImage = `url(${place.background})`;
    renderGrid(place.gridSize.rows, place.gridSize.cols); // Grid rendern
    resizeGrid(place.gridSize.rows, place.gridSize.cols); // Größe anpassen
}

//Display the grid with all its elements
function renderGrid(rows, cols) {
    mapGrid.innerHTML = ""; // Alte Zellen entfernen
    editMapGrid.innerHTML = "";

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.className = "mapCell";
            cell.dataset.col = c;
            cell.dataset.row = r;
            // Elemente sammeln
            const npcsHere = npcs?.filter(npc =>
                npc.schedule?.some(entry =>
                    entry.placeId === currentPlace &&
                    entry.row === r &&
                    entry.col === c &&
                    entry.timeStart === timeline[currentIndex]?.id
                )
            ) || [];

            const objectsHere = objects?.filter(obj =>
                obj.position &&
                obj.position.type === "place" &&
                obj.position.targetId === currentPlace &&
                obj.position.x === c &&
                obj.position.y === r
            ) || [];

            // Symbol-Element erstellen
            const symbolElement = document.createElement("span");
            symbolElement.className = "mapElement";

            if (npcsHere.length + objectsHere.length > 1) {
                symbolElement.textContent = "📍";
            } else if (npcsHere.length === 1) {
                symbolElement.textContent = "👤";
            } else if (objectsHere.length === 1) {
                symbolElement.textContent = "🔍";
            }

            // Tooltip-Overlay erstellen
            if (npcsHere.length > 0 || objectsHere.length > 0) {
                const tooltip = document.createElement("div");
                tooltip.className = "hoverOverlay";
                
                npcsHere.forEach(npc => {
                    const npcItem = document.createElement("div");
                    npcItem.className = "hoverItem";
                    const btnNPCItem = document.createElement("div");
                    btnNPCItem.className = "hoverItem";

                    const img = document.createElement("img");
                    img.src = npc.image || "assets/default_npc.png";
                    img.alt = npc.name || "(Unbenannter NPC)";
                    img.className = "hoverImage";

                    const name = document.createElement("span");
                    name.textContent = npc.name || "(Unbenannter NPC)";

                    btnNPCItem.appendChild(img);
                    btnNPCItem.appendChild(name);
                    npcItem.appendChild(btnNPCItem);
                    if (editScenarioEnabled) {
                        const deleteItem = document.createElement("span");
                        deleteItem.className = "hoverItem";
                        deleteItem.className = "tooltipBtnRemove";
                        deleteItem.textContent = "❌";
                        deleteItem.addEventListener("click", (e) => {
                            e.stopPropagation();
                            // Entfernt den Schedule-Eintrag für diesen NPC
                            npc.schedule = npc.schedule.filter(entry =>
                                !(entry.placeId === currentPlace && entry.row === r && entry.col === c)
                            );
                            loadSelectedPlace(locationSelect.value); // Aktualisiert die Anzeige
                        });
                        npcItem.appendChild(deleteItem);
                    }
                    tooltip.appendChild(npcItem);

                    // Event-Listener für Klick auf das NPC-Element
                    btnNPCItem.addEventListener("click", (e) => {
                        e.stopPropagation(); // Verhindert, dass andere Events ausgelöst werden
                        displaySelectedDetails(npc); // Zeige Details im "Selected"-Tab
                        document.querySelector('.tab-button[data-tab="tabSelected"]').click(); // Wechsle zum "Selected"-Tab
                    });
                });

                objectsHere.forEach(obj => {
                    const objectItem = document.createElement("div");
                    objectItem.className = "hoverItem";
                    const btnObjectItem = document.createElement("div");
                    btnObjectItem.className = "hoverItem";

                    const img = document.createElement("img");
                    img.src = obj.image || "assets/default_object.png";
                    img.alt = obj.name || "(Unbenanntes Objekt)";
                    img.className = "hoverImage";

                    const name = document.createElement("span");
                    name.textContent = obj.name || "(Unbenanntes Objekt)";

                    btnObjectItem.appendChild(img);
                    btnObjectItem.appendChild(name);
                    objectItem.appendChild(btnObjectItem);
                    if (editScenarioEnabled) {
                        const deleteItem = document.createElement("span");
                        deleteItem.className = "hoverItem";
                        deleteItem.className = "tooltipBtnRemove";
                        deleteItem.textContent = "❌";
                        deleteItem.addEventListener("click", (e) => {
                            e.stopPropagation();
                            // Entfernt die Position des Objekts
                            obj.position = null;
                            loadSelectedPlace(locationSelect.value); // Aktualisiert die Anzeige
                        });
                        objectItem.appendChild(deleteItem);
                    }
                    tooltip.appendChild(objectItem);

                    // Event-Listener für Klick auf das Objekt-Element
                    btnObjectItem.addEventListener("click", (e) => {
                        e.stopPropagation(); // Verhindert, dass andere Events ausgelöst werden
                        displaySelectedDetails(obj); // Zeige Details im "Selected"-Tab
                        document.querySelector('.tab-button[data-tab="tabSelected"]').click(); // Wechsle zum "Selected"-Tab
                    });
                    
                });

                symbolElement.appendChild(tooltip);

                // Dynamische Tooltip-Positionierung
                symbolElement.addEventListener("mouseenter", () => {
                    const rect = symbolElement.getBoundingClientRect();


                    const mapRect = editScenarioEnabled ? editMapGrid.getBoundingClientRect() : mapGrid.getBoundingClientRect();



                    // Überprüfen, ob zu nah am oberen Rand
                    if (rect.top - mapRect.top < 50) {
                        tooltip.style.top = "100%";
                        tooltip.style.bottom = "auto";
                    } else {
                        tooltip.style.top = "auto";
                        tooltip.style.bottom = "100%";
                    }

                    // Überprüfen, ob zu nah am linken Rand
                    if (rect.left - mapRect.left < 50) {
                        tooltip.style.left = "0";
                        tooltip.style.transform = "translateX(0)";
                    } else if (rect.right > mapRect.right - 50) {
                        // Überprüfen, ob zu nah am rechten Rand
                        tooltip.style.left = "auto";
                        tooltip.style.right = "0";
                        tooltip.style.transform = "translateX(0)";
                    } else {
                        // Standard: Zentriert
                        tooltip.style.left = "50%";
                        tooltip.style.right = "auto";
                        tooltip.style.transform = "translateX(-50%)";
                    }
                });
            }

            cell.appendChild(symbolElement);
            if (editScenarioEnabled) {
                editMapGrid.appendChild(cell);
            }
            else {
                mapGrid.appendChild(cell);
            }

        }
    }
    if (editScenarioEnabled) {
        enableScenarioDrop();
    }
}

//change the size of the grid so it fits in the visible area
function resizeGrid(rows, cols) {
    const containerWidth = editScenarioEnabled ? editMapGrid.clientWidth : mapGrid.clientWidth;
    const containerHeight = Math.min(
        editScenarioEnabled ? editMapGrid.clientHeight : mapGrid.clientHeight,
        window.innerHeight - document.querySelector("header").offsetHeight // Platz für Header abziehen
    );
    const cellSize = Math.min(containerWidth / cols, containerHeight / rows);
    const finalCellSize = Math.floor(cellSize);

    const targetGrid = editScenarioEnabled ? editMapGrid : mapGrid;
    targetGrid.style.gridTemplateColumns = `repeat(${cols}, ${finalCellSize}px)`;
    targetGrid.style.gridTemplateRows = `repeat(${rows}, ${finalCellSize}px)`;

    // Symbole skalieren
    const symbols = targetGrid.querySelectorAll(".mapElement");
    symbols.forEach((symbol) => {
        symbol.style.fontSize = `${finalCellSize * 0.7}px`; // Symbolgröße auf 80% der Zelle setzen
        symbol.style.lineHeight = `${finalCellSize}px`;    // Zentrierung sicherstellen
    });

    // Tooltips nicht skalieren
    const tooltips = targetGrid.querySelectorAll(".hoverOverlay");
    tooltips.forEach((tooltip) => {
        tooltip.style.fontSize = ""; // Setzt die Schriftgröße auf den Standard zurück
    });
}

//Load a place into the grid by the placeid
function loadSelectedPlace(placeId) {
    const place = places.find(p => p.id === placeId);
    if (place) {
        renderPlace(place);
    } else {
        console.log("Ort nicht gefunden:", placeId);
    }
}


function displaySelectedDetails(item) {
    const selectedTab = document.getElementById("tabSelected");
    selectedTab.innerHTML = ""; // Vorherigen Inhalt entfernen

    // Charakterbogen Container
    const charSheet = document.createElement("div");
    charSheet.classList.add("character-sheet");

    // Bild hinzufügen
    const img = document.createElement("img");
    img.src = item.image || (item.schedule ? "assets/default_npc.png" : "assets/default_object.png");
    img.alt = item.name || "Unbenannt";
    img.classList.add("character-image");
    charSheet.appendChild(img);

    // Name hinzufügen
    const name = document.createElement("h1");
    name.textContent = item.name || "(Unbenannt)";
    name.classList.add("character-name");
    charSheet.appendChild(name);

    // Zusätzliche Basisattribute (Name, Beruf, etc.) anzeigen
    if (item.schedule) {
        const baseAttributes = document.createElement("div");
        baseAttributes.classList.add("base-attributes");

        const fields = [
            { label: "name", value: item.name, i18n: "name" },
            { label: "profession", value: item.profession || "N/N", i18n: "profession" },
            { label: "appearance", value: item.appearance?.replace(/\n/g, "<br>") || "N/N", i18n: "appearance" },
            { label: "description", value: item.description?.replace(/\n/g, "<br>") || "N/N", i18n: "description" }
        ];

        fields.forEach(field => {
            const fieldDiv = document.createElement("div");
            fieldDiv.classList.add("base-attribute-field");

            const fieldLabel = document.createElement("strong");
            fieldLabel.dataset.i18n = field.i18n;

            const fieldValue = document.createElement("span");
            fieldValue.innerHTML = field.value; // HTML-Inhalt für Zeilenumbrüche verwenden

            fieldDiv.appendChild(fieldLabel);
            fieldDiv.appendChild(fieldValue);
            baseAttributes.appendChild(fieldDiv);
        });

        // HP anzeigen (bearbeitbar für Current HP)
        const hpFields = [
            { label: "currhp", current: "currentHP", max: "maxHP", i18n: "currhp" },
            { label: "currentmentalhp", current: "currentMentalHP", max: "maxMentalHP", i18n: "currentmentalhp" }
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
                console.log(`${hp.current} aktualisiert:`, item[hp.current]);
            });

            const maxSpan = document.createElement("span");
            maxSpan.textContent = ` / ${item[hp.max] || 0}`;

            hpDiv.appendChild(hpLabel);
            hpDiv.appendChild(currentInput);
            hpDiv.appendChild(maxSpan);
            baseAttributes.appendChild(hpDiv);
        });

        charSheet.appendChild(baseAttributes);

        // Attribute anzeigen
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
                noAttributesMessage.textContent = "Keine Attribute vorhanden.";
                attributesList.appendChild(noAttributesMessage);
            }

            categoryContainer.appendChild(attributesList);
            attributesGrid.appendChild(categoryContainer);
        });

        attributesSection.appendChild(attributesGrid);
        charSheet.appendChild(attributesSection);
    }

    // Objekte ohne Attribute anzeigen
    if (!item.schedule) {
        const objectDetails = document.createElement("div");
        objectDetails.classList.add("object-details");

        const description = document.createElement("p");
        description.innerHTML = item.description?.replace(/\n/g, "<br>") || "Keine Beschreibung verfügbar.";
        description.classList.add("object-description");
        objectDetails.appendChild(description);

        // Besitzer anzeigen
        if (item.position) {
            const ownerDiv = document.createElement("div");
            ownerDiv.classList.add("owner-details");

            if (item.position.type === "npc") {
                const owner = npcs.find(npc => npc.id === item.position.targetId);
                if (owner) {
                    const positionTitle = document.createElement("span");
                    positionTitle.dataset.i18n = "located_with";
                    const card = renderItemCard(owner, 'npc');
                    ownerDiv.appendChild(positionTitle);
                    ownerDiv.appendChild(card);
                }
            } else if (item.position.type === "place") {
                const place = places.find(p => p.id === item.position.targetId);
                if (place) {
                    const positionTitle = document.createElement("span");
                    positionTitle.dataset.i18n = "located_with";

                    const card = renderItemCard(place, 'place');
                    ownerDiv.appendChild(positionTitle);
                    ownerDiv.appendChild(card);
                }
            }

            objectDetails.appendChild(ownerDiv);
        }

        charSheet.appendChild(objectDetails);
    }

    // Inventar anzeigen
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
            const card = renderItemCard(obj, 'object');
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
    loadLanguage(currentLanguage, languages);
    document.querySelector('.tab-button[data-tab="tabSelected"]').click();
}


