// Toggle button and sidebar references
const toggleSidebarButton = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const toggleAllSidebarMenuBtnTxt = document.querySelectorAll("#sidebarMenuBtnTxt");

// Real-time and page-timer elements
const realTimeElement = document.getElementById("realTime");
const pageTimerElement = document.getElementById("pageTimer");
let secondsElapsed = 0;

// Dropdowns and other controls
const locationSelect = document.getElementById("locationSelect");
// timeSlider is declared in the original code, but not currently used
// const timeSlider = document.getElementById("timeSlider");

// Event listener to toggle sidebar visibility
toggleSidebarButton.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    toggleAllSidebarMenuBtnTxt.forEach((txt) => {
        txt.classList.toggle("collapsed");
    });
    loadSelectedPlace(locationSelect.value);
});

// Spoiler text toggle
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("spoiler")) {
        const isHidden = event.target.style.color === "black";
        event.target.style.color = isHidden ? "white" : "black";
    }
});

// Update selected location
locationSelect.addEventListener("change", () => {
    locationChanged();
});

/**
 * Updates the clock display every second.
 */
function updateRealTime() {
    const now = new Date();
    realTimeElement.textContent = now.toLocaleTimeString();
}

/**
 * Increments and displays the page timer (hours/minutes/seconds).
 */
function updatePageTimer() {
    secondsElapsed++;
    const hours = Math.floor(secondsElapsed / 3600);
    const minutes = Math.floor((secondsElapsed % 3600) / 60);
    const seconds = secondsElapsed % 60;
    pageTimerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Triggered when the user selects a different location in the dropdown.
 * Sets the current place, updates the map, NPCs, and objects.
 */
function locationChanged() {
    const selectedPlaceId = locationSelect.value;
    const currentTimeId = timeline[currentIndex]?.id;
    currentPlace = selectedPlaceId;
    loadSelectedPlace(selectedPlaceId);
    updateDynamicLists();
    console.log("Location changed to:", selectedPlaceId);
    updateAndCheckEvents();
}

/**
 * Populates the location dropdown with all places.
 * Selects the first place by default if available.
 */
function populateLocationSelect() {
    locationSelect.innerHTML = "";
    places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place.id;
        option.textContent = place.name || "(Unnamed Place)";
        locationSelect.appendChild(option);
    });
    if (places.length > 0) {
        locationSelect.value = places[0].id;
        loadSelectedPlace(places[0].id);
    }
}

/**
 * Updates NPC and object lists when the location or timeline index changes.
 */
function updateDynamicLists() {
    const selectedPlaceId = locationSelect.value;
    const currentTimeId = timeline[currentIndex]?.id;
    updateNPCList(selectedPlaceId, currentTimeId);
    updateObjectList(selectedPlaceId);
}

/**
 * Displays NPCs for the selected place and current time.
 */
function updateNPCList(placeId, currentTimeId) {
    const npcListHere = document.getElementById("npcListHere");
    npcListHere.innerHTML = "";
    const filteredNPCs = npcs.filter(npc =>
        npc.schedule.some(entry => entry.placeId === placeId && entry.timeStart === currentTimeId)
    );
    filteredNPCs.forEach(npc => {
        const card = renderItemCard(npc, "npc");
        npcListHere.appendChild(card);
    });
}

/**
 * Displays objects for the selected place if they are placed there.
 */
function updateObjectList(placeId) {
    const objectListHere = document.getElementById("objectListHere");
    objectListHere.innerHTML = "";
    const filteredObjects = objects.filter(obj =>
        obj.position && obj.position.type === "place" && obj.position.targetId === placeId
    );
    filteredObjects.forEach(obj => {
        const card = renderItemCard(obj, "object");
        objectListHere.appendChild(card);
    });
}

// Initial actions on page load
loadLanguages();
populateLocationSelect();
setInterval(updateRealTime, 1000);
setInterval(updatePageTimer, 1000);

/**
 * Registers a service worker if available, logging success or failure.
 */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then(registration => {
                console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch(error => {
                console.log("Service Worker registration failed:", error);
            });
    });
}
