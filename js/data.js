/********************************************************************************
 * This file defines the scenario data structures (meta, npcs, objects, etc.), 
 * a function to generate unique IDs, a custom Quill blot for spoiler content, 
 * and utility methods to render item cards in the UI.
 ********************************************************************************/

// Global scenario data
let meta = {
  name: "Scenario",
  ruleset: "htbah"
};

let npcs = [];
let objects = [];
let places = [];
let timeline = [];
let events = [];

/**
 * Generates a new unique ID by scanning all existing IDs across npcs, objects,
 * places, timeline, unsavedTimeline, and events. Returns the next available ID.
 */
function generateID() {
  const allIDs = [
    ...npcs.map(npc => parseInt(npc.id, 10)),
    ...objects.map(obj => parseInt(obj.id, 10)),
    ...places.map(place => parseInt(place.id, 10)),
    ...timeline.map(tim => parseInt(tim.id, 10)),
    ...unsavedTimeline.map(utim => parseInt(utim.id, 10)),
    ...events.map(utim => parseInt(utim.id, 10))
  ].filter(id => !isNaN(id));

  const nextID = allIDs.length > 0 ? Math.max(...allIDs) + 1 : 1;
  return nextID.toString();
}

// Quill inline blot extension for "spoiler" text
const Inline = Quill.import("blots/inline");

class SpoilerBlot extends Inline {
  static create() {
    const node = super.create();
    node.setAttribute("class", "spoiler");
    node.setAttribute(
      "style",
      "background-color: black; color: black; cursor: pointer;"
    );
    node.setAttribute("title", "Spoiler: Klicken zum Anzeigen");
    return node;
  }

  static formats(node) {
    return node.getAttribute("class") === "spoiler";
  }
}

SpoilerBlot.blotName = "spoiler";
SpoilerBlot.tagName = "span";

Quill.register(SpoilerBlot);

/**
 * Creates a small "card" element to visually represent various data types 
 * (NPC, object, place, or event) in the UI.
 */
function renderItemCard(data, type) {
  const card = document.createElement("div");
  card.classList.add("itemCard", "card");
  card.style.position = "relative";

  if (type !== "event") {
    const img = document.createElement("img");

    if (data.image || type !== "place") {
      img.src = data.image || `assets/default_${type}.png`;
    } else {
      img.src = data.background || `assets/default_${type}.png`;
    }

    img.alt = data.name || "Unbenannt";
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.objectFit = "cover";
    card.appendChild(img);
  }

  const nameEl = document.createElement("div");
  nameEl.textContent = data.name || "(Unbenannt)";
  nameEl.classList.add("itemName");
  card.appendChild(nameEl);

  const infoButton = document.createElement("button");
  infoButton.innerHTML = "🛈";
  infoButton.classList.add("infoButton");
  infoButton.style.position = "absolute";
  infoButton.style.top = "5px";
  infoButton.style.right = "5px";
  infoButton.style.padding = "0px 4px 2px 4px";

  infoButton.addEventListener("click", (e) => {
    e.stopPropagation();
    displaySelectedDetails(data);
    document.querySelector('.tab-button[data-tab="tabSelected"]').click();
  });

  card.appendChild(infoButton);
  return card;
}

/**
 * Applies a visual highlight (outline) to the selected item card,
 * removing any highlight from previously selected cards.
 */
function highlightSelectedItemCard(selectedItemDiv) {
  const allItems = document.querySelectorAll(".card");
  allItems.forEach((item) => {
    item.style.outline = "none";
  });
  selectedItemDiv.style.outline = "var(--accent-color) 4px solid";
}
