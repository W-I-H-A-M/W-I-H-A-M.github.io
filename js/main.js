//main.js

// Wir holen uns den Toggle-Button und das Sidebar-Element
const toggleSidebarButton = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const toggleAllSidebarMenuBtnTxt = document.querySelectorAll("#sidebarMenuBtnTxt");

const realTimeElement = document.getElementById("realTime");
const pageTimerElement = document.getElementById("pageTimer");
let secondsElapsed = 0;


// Fügen ein Event hinzu, das auf Klick reagiert
toggleSidebarButton.addEventListener("click", () => {
    // Wir togglen eine Klasse, z.B. "collapsed", auf dem Sidebar-Element
    sidebar.classList.toggle("collapsed");
    toggleAllSidebarMenuBtnTxt.forEach((txt) => {
        console.log(txt);
        txt.classList.toggle("collapsed");
    })
    loadSelectedPlace(locationSelect.value);
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('spoiler')) {
        const isHidden = event.target.style.color === 'black';
        event.target.style.color = isHidden ? 'white' : 'black';
    }
});

// Hol dir die Elemente aus dem DOM
const locationSelect = document.getElementById("locationSelect");
const timeSlider = document.getElementById("timeSlider");

// Ort (Location) ändern
locationSelect.addEventListener("change", () => {
    locationChanged()
});

function updateRealTime() {
    const now = new Date();
    realTimeElement.textContent = now.toLocaleTimeString();
}

function updatePageTimer() {
    secondsElapsed++;
    const hours = Math.floor(secondsElapsed / 3600);
    const minutes = Math.floor((secondsElapsed % 3600) / 60);
    const seconds = secondsElapsed % 60;
    pageTimerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
}

function locationChanged() {
    const selectedPlaceId = locationSelect.value;
    const currentTimeId = timeline[currentIndex]?.id; // Aktuelle Zeit-ID aus der Timeline
    currentPlace = selectedPlaceId;
    loadSelectedPlace(selectedPlaceId); // Karte mit dem ausgewählten Ort laden
    updateDynamicLists();
    console.log("Ort geändert zu:", selectedPlaceId);
    updateAndCheckEvents();
}


function populateLocationSelect() {
    const locationSelect = document.getElementById("locationSelect");
    locationSelect.innerHTML = ""; // Aktuelle Einträge entfernen

    places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place.id;
        option.textContent = place.name || "(Unbenannter Ort)";
        locationSelect.appendChild(option);
    });

    if (places.length > 0) {
        // Standardmäßig den ersten Ort auswählen
        locationSelect.value = places[0].id;
        loadSelectedPlace(places[0].id);
    }
}

// Call this function whenever places are updated
populateLocationSelect();


// Funktion, um NPCs und Objekte dynamisch zu aktualisieren
function updateDynamicLists() {
    const selectedPlaceId = locationSelect.value;
    const currentTimeId = timeline[currentIndex]?.id; // Aktuelle Zeit-ID
    updateNPCList(selectedPlaceId, currentTimeId); // NPC-Liste aktualisieren
    updateObjectList(selectedPlaceId); // Objekt-Liste aktualisieren
}

// Funktion, um NPCs basierend auf Ort und Zeit zu filtern
function updateNPCList(placeId, currentTimeId) {
    const npcListHere = document.getElementById("npcListHere");
    npcListHere.innerHTML = ""; // Alte Einträge entfernen

    const filteredNPCs = npcs.filter(npc =>
        npc.schedule.some(entry =>
            entry.placeId === placeId &&
            entry.timeStart === currentTimeId
        )
    );

    filteredNPCs.forEach(npc => {
        const card = renderItemCard(npc, 'npc');
        npcListHere.appendChild(card);
    });
}

// Funktion, um Objekte basierend auf dem Ort zu filtern
function updateObjectList(placeId) {
    const objectListHere = document.getElementById("objectListHere");
    objectListHere.innerHTML = ""; // Alte Einträge entfernen

    const filteredObjects = objects.filter(obj =>
        obj.position && obj.position.type === "place" && obj.position.targetId === placeId
    );

    filteredObjects.forEach(obj => {
        const card = renderItemCard(obj, 'object');
        objectListHere.appendChild(card);
    });
}
loadLanguages();
setInterval(updateRealTime, 1000); // Aktualisiert jede Sekunde
setInterval(updatePageTimer, 1000); // Zählt jede Sekunde


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