//import.js

document.getElementById("btnImportScenario").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
});

document.getElementById("importFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const jszip = new JSZip();
        const content = await jszip.loadAsync(file);
        importScenario(content);
    }
});


async function importScenario(zipContent) {
    try {
        try {
            const meatadata = await zipContent.file("meta.json").async("string");
            meta = JSON.parse(meatadata);
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Metadata could not be imported!",
                duration: 3000,
            });
        }
        try {
            const npcsData = await zipContent.file("npcs.json").async("string");
            npcs = JSON.parse(npcsData);
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> NPCs could not be imported!",
                duration: 3000,
            });
        }
        try {
            const objectsData = await zipContent.file("objects.json").async("string");
            objects = JSON.parse(objectsData).map(obj => ({
                ...obj,
                position: obj.position ? {
                    type: obj.position.type,
                    targetId: obj.position.targetId,
                    x: obj.position.type === "place" ? obj.position.x : undefined,
                    y: obj.position.type === "place" ? obj.position.y : undefined
                } : null
            }));
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Objects could not be imported!",
                duration: 3000,
            });
        }

        try {
            const placesData = await zipContent.file("places.json").async("string");
            places = JSON.parse(placesData);
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Places could not be imported!",
                duration: 3000,
            });
        }

        try {
            const timelineData = await zipContent.file("timeline.json").async("string");
            timeline = JSON.parse(timelineData);
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Timeline could not be imported!",
                duration: 3000,
            });
        }

        try {
            const eventsData = await zipContent.file("events.json").async("string");
            events = JSON.parse(eventsData).map(ev => ({
                ...ev,
                conditions: ev.conditions || [] // Standardwert für Bedingungen setzen
            }));
        }
        catch {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Events could not be imported!",
                duration: 3000,
            });
        }

        // Bilder laden (wie zuvor)
        const imagesFolder = zipContent.folder("images");
        if (imagesFolder) {
            for (const filePath of Object.keys(zipContent.files)) {
                if (filePath.startsWith("images/")) {
                    const file = zipContent.file(filePath);
                    if (file) {
                        const base64Image = await file.async("base64");
                        const [type, idWithExtension] = filePath.split("/")[1].split("_");
                        const id = idWithExtension.split(".")[0];
                        const image = `data:image/png;base64,${base64Image}`;

                        if (type === "npc") {
                            const npc = npcs.find(n => n.id === id);
                            if (npc) npc.image = image;
                        } else if (type === "object") {
                            const obj = objects.find(o => o.id === id);
                            if (obj) obj.image = image;
                        } else if (type === "place") {
                            const place = places.find(p => p.id === id);
                            if (place) place.background = image;
                        }
                    }
                }
            }
        }

        console.log("Import abgeschlossen:", { npcs, objects, places, timeline });

        // UI aktualisieren
        loadMetadata();
        renderNPCListRight();
        renderdivObjectListRight();
        renderdivplaceListRight();
        renderTimeline();
        renderdivEventListRight();
        populateLocationSelect();
        updateTimeDisplay(currentIndex);
        const defaultPlace = places.find(place => place.default === true) || places[0];
        locationSelect.value = defaultPlace.id
        locationChanged();
        renderdivInventoryListRight();
        enableDragAndDropTabs();
        showNotification({
            type: "success",
            content: "<strong>Import erfolgreich!</strong> Szenario erfolgreich importiert!",
            duration: 3000,
        });
    } catch (error) {
        console.error("Fehler beim Import:", error);
        showNotification({
            type: "error",
            content: "<strong>Fehler:</strong> Fehler beim Import. Bitte überprüfe die ZIP-Datei.",
            duration: 0,
        });
    }
}