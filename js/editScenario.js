//editScenario.js
let editScenarioEnabled = false;


// Aktivierung des Drag-and-Drop für NPCs und Objekte in den Tabs "Alle NPCs" und "Alle Objekte"
function enableDragAndDropTabs() {
    const allNpcTab = document.querySelector("#divAllNPCListRight");
    const allObjectTab = document.querySelector("#divAllObjectsListRight");

    // Befüllen des "Alle NPCs"-Tabs
    allNpcTab.innerHTML = "";
    npcs.forEach(npc => {
        const card = renderItemCard(npc, 'npc');
        card.setAttribute("draggable", true);
        card.addEventListener("dragstart", event => {
            event.dataTransfer.setData("type", "npc");
            event.dataTransfer.setData("id", npc.id);
        });
        allNpcTab.appendChild(card);
    });

    // Befüllen des "Alle Objekte"-Tabs
    allObjectTab.innerHTML = "";
    objects.forEach(obj => {
        const card = renderItemCard(obj, 'object');
        card.setAttribute("draggable", true);
        card.addEventListener("dragstart", event => {
            event.dataTransfer.setData("type", "object");
            event.dataTransfer.setData("id", obj.id);
        });
        allObjectTab.appendChild(card);
    });
}

function handleEditScenarioGridDrop(event) {
    event.preventDefault();

    const type = event.dataTransfer.getData("type");
    const id = event.dataTransfer.getData("id");
    const cell = event.target.closest(".mapCell");

    if (cell) {
        const col = parseInt(cell.dataset.col, 10);
        const row = parseInt(cell.dataset.row, 10);

        if (type === "npc") {
            const npc = npcs.find(n => n.id === id);
            if (npc) {
                npc.schedule.push({
                    timeStart: timeline[currentIndex]?.id || "0",
                    placeId: currentPlace,
                    row,
                    col
                });
            }
        } else if (type === "object") {
            const obj = objects.find(o => o.id === id);
            if (obj) {
                obj.position = {
                    type: "place",
                    targetId: currentPlace,
                    x: col,
                    y: row
                };
            }
        }

        cell.classList.remove("highlight"); // Highlight entfernen
    }

    loadSelectedPlace(locationSelect.value); // Grid neu rendern, um Änderungen anzuzeigen
    updateAndCheckEvents();
}

function handleEditScenarioGridDragover(event) {
    event.preventDefault();
    const cell = event.target.closest(".mapCell");
    if (cell) {
        cell.classList.add("highlight");
    }
}

function handleEditScenarioGridDragleave(event) {
    const cell = event.target.closest(".mapCell");
    if (cell) {
        cell.classList.remove("highlight");
    }
}

// Aktivierung des Drag-and-Drop für den Content-Bereich divEditScenario
function enableScenarioDrop() {
    const editScenarioGrid = document.querySelector("#editMapGrid");

    editScenarioGrid.removeEventListener("dragover", handleEditScenarioGridDragover);
    editScenarioGrid.addEventListener("dragover", handleEditScenarioGridDragover);
    editScenarioGrid.removeEventListener("dragleave", handleEditScenarioGridDragleave);
    editScenarioGrid.addEventListener("dragleave", handleEditScenarioGridDragleave);
    editScenarioGrid.removeEventListener("drop", handleEditScenarioGridDrop);
    editScenarioGrid.addEventListener("drop", handleEditScenarioGridDrop);
}

// Initialisierung
function initializeScenarioDragAndDrop() {
    enableDragAndDropTabs(); // Tabs mit NPCs und Objekten befüllen
    enableScenarioDrop();    // Grid-Drop aktivieren
}

