// **************************************
// Global State & Setup
// **************************************

let editScenarioEnabled = false;

/**
 * Populates the "All NPCs" and "All Objects" tabs with draggable cards
 * so they can be dropped onto the scenario grid.
 */
function enableDragAndDropTabs() {
    const allNpcTab = document.querySelector("#divAllNPCListRight");
    const allObjectTab = document.querySelector("#divAllObjectsListRight");

    // Clear and populate the "All NPCs" tab
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

    // Clear and populate the "All Objects" tab
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

/**
 * Handles the drop event in the editable scenario grid. 
 * Determines whether an NPC or object is being dropped
 * and updates its position/schedule accordingly.
 */
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
        cell.classList.remove("highlight");
    }

    // Re-render the grid to reflect changes
    loadSelectedPlace(locationSelect.value);
    updateAndCheckEvents();
}

/**
 * Highlights a grid cell when dragging an NPC or object over it.
 */
function handleEditScenarioGridDragover(event) {
    event.preventDefault();
    const cell = event.target.closest(".mapCell");
    if (cell) {
        cell.classList.add("highlight");
    }
}

/**
 * Removes the highlight from a grid cell when the drag leaves it.
 */
function handleEditScenarioGridDragleave(event) {
    const cell = event.target.closest(".mapCell");
    if (cell) {
        cell.classList.remove("highlight");
    }
}

/**
 * Enables dropping of NPCs/objects on the edit scenario grid.
 */
function enableScenarioDrop() {
    const editScenarioGrid = document.querySelector("#editMapGrid");

    editScenarioGrid.removeEventListener("dragover", handleEditScenarioGridDragover);
    editScenarioGrid.addEventListener("dragover", handleEditScenarioGridDragover);

    editScenarioGrid.removeEventListener("dragleave", handleEditScenarioGridDragleave);
    editScenarioGrid.addEventListener("dragleave", handleEditScenarioGridDragleave);

    editScenarioGrid.removeEventListener("drop", handleEditScenarioGridDrop);
    editScenarioGrid.addEventListener("drop", handleEditScenarioGridDrop);
}

/**
 * Initializes drag-and-drop functionality in the scenario editing mode:
 * 1) Populates tabs with NPCs and objects.
 * 2) Enables dropping on the scenario grid.
 */
function initializeScenarioDragAndDrop() {
    enableDragAndDropTabs();
    enableScenarioDrop();
}
