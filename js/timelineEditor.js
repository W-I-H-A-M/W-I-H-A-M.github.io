//timelineEditor.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////
const timelineTableBody = document.querySelector("#timelineTable tbody");
const btnNewTimelineEntry = document.getElementById("btnNewTimelineEntry");
const btnSaveTimeline = document.getElementById("btnSaveTimeline");
const currentTime = document.getElementById("currentTime");
const prevTime = document.getElementById("prevTime");
const nextTime = document.getElementById("nextTime");

let unsavedTimeline = [...timeline]; // Lokale Kopie der Timeline
let currentIndex = 0; // Aktueller Index in der Timeline

/////////////////
//Eventlistener//
/////////////////

btnSaveTimeline.addEventListener("click", () => {
    try {
        timeline = [...unsavedTimeline]; // Änderungen übernehmen
        console.log("Änderungen gespeichert:", timeline);
        updateTimeDisplay(currentIndex);
        showNotification({
            type: "success",
            content: "Successfully Saved",
            duration: 1000,
        });
    } catch (error) {
        showNotification({
            type: "error",
            content: "<strong>Fehler:</strong> Could not Save.",
            duration: 0,
        });
    }
});

prevTime.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--; // Einen Schritt zurückgehen
        updateTimeDisplay(currentIndex); // Zeitanzeige aktualisieren
        updateDynamicLists();
    }
});

nextTime.addEventListener("click", () => {
    if (currentIndex < timeline.length - 1) {
        currentIndex++; // Einen Schritt vorgehen
        updateTimeDisplay(currentIndex); // Zeitanzeige aktualisieren
        updateDynamicLists();
    }
});

/////////////
//Functions//
/////////////

// Adds new entry
btnNewTimelineEntry.addEventListener("click", () => {
    const newEntry = {
        id: generateID(),
        title: "N/N",
        description: "",
        order: unsavedTimeline.length + 1
    };
    unsavedTimeline.push(newEntry); // Neuen Eintrag zur lokalen Kopie hinzufügen
    renderTimeline(); // Tabelle neu rendern
});

// delets entry
function deleteTimelineEntry(id) {
    timeline = timeline.filter(entry => entry.id !== id);
    renderTimeline();
}

//adds drag and drop functionality to move the orders arround
function enableDragAndDrop() {
    const rows = Array.from(timelineTableBody.children);
    let dropIndicator = null;

    rows.forEach(row => {
        const dragHandle = row.querySelector(".drag-handle");

        dragHandle.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", row.getAttribute("data-id"));
            row.classList.add("dragging");
        });

        row.addEventListener("dragover", (e) => {
            e.preventDefault();

            if (!dropIndicator) {
                dropIndicator = document.createElement("div");
                dropIndicator.classList.add("drop-indicator");
            }

            const targetRow = e.target.closest("tr");
            if (targetRow) {
                const rect = targetRow.getBoundingClientRect();
                const isAboveMiddle = e.clientY < rect.top + rect.height / 2;

                if (isAboveMiddle) {
                    // Drop-Indikator vor der Zielzeile platzieren
                    timelineTableBody.insertBefore(dropIndicator, targetRow);
                } else {
                    // Drop-Indikator nach der Zielzeile platzieren
                    timelineTableBody.insertBefore(dropIndicator, targetRow.nextSibling);
                }
            }
        });

        row.addEventListener("dragleave", () => {
            if (dropIndicator) {
                dropIndicator.remove();
                dropIndicator = null;
            }
        });

        row.addEventListener("drop", (e) => {
            e.preventDefault();

            const draggedId = e.dataTransfer.getData("text/plain");

            if (dropIndicator && dropIndicator.parentNode) {
                const draggedIndex = timeline.findIndex(entry => entry.id === draggedId);
                const indicatorIndex = Array.from(timelineTableBody.children).indexOf(dropIndicator);

                if (draggedIndex !== -1 && indicatorIndex !== -1) {
                    const [draggedEntry] = timeline.splice(draggedIndex, 1);
                    timeline.splice(indicatorIndex, 0, draggedEntry);

                    // Reihenfolge aktualisieren
                    timeline.forEach((entry, index) => {
                        entry.order = index + 1;
                    });

                    renderTimeline();
                }
            }

            if (dropIndicator) {
                dropIndicator.remove();
                dropIndicator = null;
            }
        });
    });

    document.addEventListener("dragend", () => {
        if (dropIndicator) {
            dropIndicator.remove();
            dropIndicator = null;
        }
        document.querySelectorAll(".dragging").forEach(row => row.classList.remove("dragging"));
    });
}

//creates tabele from timeline
function renderTimeline() {
    timelineTableBody.innerHTML = ""; // Tabelle leeren

    unsavedTimeline.sort((a, b) => a.order - b.order).forEach(entry => {
        const row = document.createElement("tr");
        row.classList.add("draggable");
        row.setAttribute("data-id", entry.id); // Setze die ID für jede Zeile

        // Reihenfolge-Spalte mit Drag-Handle und Nummer
        const orderCell = document.createElement("td");
        const dragHandle = document.createElement("span");
        dragHandle.textContent = "⋮⋮"; // Unicode-Symbol für Drag-and-Drop
        dragHandle.style.cursor = "grab";
        dragHandle.classList.add("drag-handle");
        dragHandle.setAttribute("draggable", true); // Drag-and-Drop nur für das Handle

        const orderNumber = document.createElement("span");
        orderNumber.textContent = ` ${entry.order}`;
        orderNumber.style.marginLeft = "8px";

        orderCell.appendChild(dragHandle);
        orderCell.appendChild(orderNumber);
        row.appendChild(orderCell);

        // Titel-Spalte (bearbeitbar)
        const titleCell = document.createElement("td");
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = entry.title;
        titleInput.addEventListener("input", () => {
            entry.title = titleInput.value; // Lokale Kopie aktualisieren
        });
        titleCell.appendChild(titleInput);
        row.appendChild(titleCell);

        // Beschreibung-Spalte (bearbeitbar)
        const descriptionCell = document.createElement("td");
        const descriptionInput = document.createElement("textarea");
        descriptionInput.value = entry.description;
        descriptionInput.addEventListener("input", () => {
            entry.description = descriptionInput.value; // Lokale Kopie aktualisieren
        });
        descriptionCell.appendChild(descriptionInput);
        row.appendChild(descriptionCell);

        // Aktionen-Spalte
        const actionsCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.dataset.i18n = "delete";
        deleteBtn.textContent = "Löschen";
        deleteBtn.addEventListener("click", () => {
            unsavedTimeline = unsavedTimeline.filter(e => e.id !== entry.id); // Lokale Kopie aktualisieren
            renderTimeline();
        });
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        timelineTableBody.appendChild(row);
    });

    enableDragAndDrop(); // Drag-and-Drop aktivieren
}

//controlls the current time display
function updateTimeDisplay(currentIndex) {
    const prevTime = document.getElementById("prevTime");
    const currentTime = document.getElementById("currentTime");
    const nextTime = document.getElementById("nextTime");

    // Prüfen, ob es einen vorherigen Eintrag gibt
    if (currentIndex > 0) {
        prevTime.textContent = `${timeline[currentIndex - 1].title}`;
        prevTime.title = timeline[currentIndex - 1].description;
    } else {
        prevTime.textContent = "—"; // Platzhalter
        prevTime.title = "";
    }

    // Aktuelle Zeit anzeigen
    if (timeline[currentIndex]) {
        currentTime.textContent = `${timeline[currentIndex].title}`;
        currentTime.title = timeline[currentIndex].description;
    } else {
        currentTime.textContent = "—"; // Falls kein Eintrag vorhanden ist
        currentTime.title = "";
    }

    // Prüfen, ob es einen nächsten Eintrag gibt
    if (currentIndex < timeline.length - 1) {
        nextTime.textContent = `${timeline[currentIndex + 1].title}`;
        nextTime.title = timeline[currentIndex + 1].description;
    } else {
        nextTime.textContent = "—"; // Platzhalter
        nextTime.title = "";
    }
    loadSelectedPlace(locationSelect.value);
    updateAndCheckEvents();
}