// *********************************
// Variable Declarations
// *********************************

// Local copy of the timeline and references to table elements
const timelineTableBody = document.querySelector("#timelineTable tbody");
const btnNewTimelineEntry = document.getElementById("btnNewTimelineEntry");
const btnSaveTimeline = document.getElementById("btnSaveTimeline");
const currentTime = document.getElementById("currentTime");
const prevTime = document.getElementById("prevTime");
const nextTime = document.getElementById("nextTime");

let unsavedTimeline = [...timeline];
let currentIndex = 0;

// *********************************
// Event Listeners
// *********************************

/**
 * Saves all modifications from the local timeline copy back to the main timeline.
 * If successful, triggers a notification and updates the display.
 */
btnSaveTimeline.addEventListener("click", () => {
    try {
        timeline = [...unsavedTimeline];
        console.log("Changes saved:", timeline);
        updateTimeDisplay(currentIndex);
        showNotification({
            type: "success",
            content: "Successfully Saved",
            duration: 1000
        });
    } catch (error) {
        showNotification({
            type: "error",
            content: "<strong>Error:</strong> Could not save.",
            duration: 0
        });
    }
});

/**
 * Navigates to the previous timeline entry, if one exists,
 * and updates the display accordingly.
 */
prevTime.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateTimeDisplay(currentIndex);
        updateDynamicLists();
    }
});

/**
 * Navigates to the next timeline entry, if one exists,
 * and updates the display accordingly.
 */
nextTime.addEventListener("click", () => {
    if (currentIndex < timeline.length - 1) {
        currentIndex++;
        updateTimeDisplay(currentIndex);
        updateDynamicLists();
    }
});

/**
 * Adds a new timeline entry to the local timeline copy and
 * re-renders the timeline table in the UI.
 */
btnNewTimelineEntry.addEventListener("click", () => {
    const newEntry = {
        id: generateID(),
        title: "N/N",
        description: "",
        order: unsavedTimeline.length + 1
    };
    unsavedTimeline.push(newEntry);
    renderTimeline();
});

// *********************************
// Functions
// *********************************

/**
 * Removes a specific timeline entry from the global timeline array,
 * then re-renders the timeline.
 */
function deleteTimelineEntry(id) {
    timeline = timeline.filter(entry => entry.id !== id);
    renderTimeline();
}

/**
 * Enables drag-and-drop functionality on the timeline rows, allowing
 * users to reorder them by dragging the handle. Updates the 'order'
 * property in the local timeline array.
 */
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
                    timelineTableBody.insertBefore(dropIndicator, targetRow);
                } else {
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

/**
 * Renders the timeline entries in a table, sorted by their 'order'.
 * Each row is made draggable, and input fields allow on-the-fly editing.
 */
function renderTimeline() {
    timelineTableBody.innerHTML = "";

    // Sort entries by order before displaying
    unsavedTimeline.sort((a, b) => a.order - b.order).forEach(entry => {
        const row = document.createElement("tr");
        row.classList.add("draggable");
        row.setAttribute("data-id", entry.id);

        // Order cell with drag handle
        const orderCell = document.createElement("td");
        const dragHandle = document.createElement("span");
        dragHandle.textContent = "⋮⋮";
        dragHandle.style.cursor = "grab";
        dragHandle.classList.add("drag-handle");
        dragHandle.setAttribute("draggable", true);

        const orderNumber = document.createElement("span");
        orderNumber.textContent = ` ${entry.order}`;
        orderNumber.style.marginLeft = "8px";

        orderCell.appendChild(dragHandle);
        orderCell.appendChild(orderNumber);
        row.appendChild(orderCell);

        // Title cell (editable)
        const titleCell = document.createElement("td");
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = entry.title;
        titleInput.addEventListener("input", () => {
            entry.title = titleInput.value;
        });
        titleCell.appendChild(titleInput);
        row.appendChild(titleCell);

        // Description cell (editable)
        const descriptionCell = document.createElement("td");
        const descriptionInput = document.createElement("textarea");
        descriptionInput.value = entry.description;
        descriptionInput.addEventListener("input", () => {
            entry.description = descriptionInput.value;
        });
        descriptionCell.appendChild(descriptionInput);
        row.appendChild(descriptionCell);

        // Actions cell (delete button)
        const actionsCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.dataset.i18n = "delete";
        deleteBtn.textContent = "Löschen";
        deleteBtn.addEventListener("click", () => {
            unsavedTimeline = unsavedTimeline.filter(e => e.id !== entry.id);
            renderTimeline();
        });
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        timelineTableBody.appendChild(row);
    });

    // Enable drag and drop after table rows have been created
    enableDragAndDrop();
}

/**
 * Updates the visible time entries (previous, current, next) based on
 * the current index. Also triggers updates for the place and event checks.
 */
function updateTimeDisplay(currentIndex) {
    if (currentIndex > 0) {
        prevTime.textContent = timeline[currentIndex - 1].title;
        prevTime.title = timeline[currentIndex - 1].description;
    } else {
        prevTime.textContent = "—";
        prevTime.title = "";
    }

    if (timeline[currentIndex]) {
        currentTime.textContent = timeline[currentIndex].title;
        currentTime.title = timeline[currentIndex].description;
    } else {
        currentTime.textContent = "—";
        currentTime.title = "";
    }

    if (currentIndex < timeline.length - 1) {
        nextTime.textContent = timeline[currentIndex + 1].title;
        nextTime.title = timeline[currentIndex + 1].description;
    } else {
        nextTime.textContent = "—";
        nextTime.title = "";
    }

    loadSelectedPlace(locationSelect.value);
    updateAndCheckEvents();
}
