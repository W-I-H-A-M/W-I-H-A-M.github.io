// Listens for a scenario import when user clicks the import button
document.getElementById("btnImportScenario").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
});

/**
 * Opens the selected zip file and calls 'importScenario' to process its contents.
 */
document.getElementById("importFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const jszip = new JSZip();
        const content = await jszip.loadAsync(file);
        importScenario(content);
    }
});

/**
 * Imports various scenario files from the provided ZIP content.
 * Attempts to parse meta, NPCs, objects, places, timeline, and events data.
 * Handles images embedded in an 'images' folder and updates the UI.
 */
async function importScenario(zipContent) {
    try {
        // Import metadata
        try {
            const meatadata = await zipContent.file("meta.json").async("string");
            meta = JSON.parse(meatadata);
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> Metadata could not be imported!",
                duration: 3000
            });
        }

        // Import NPCs
        try {
            const npcsData = await zipContent.file("npcs.json").async("string");
            npcs = JSON.parse(npcsData);
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> NPCs could not be imported!",
                duration: 3000
            });
        }

        // Import objects
        try {
            const objectsData = await zipContent.file("objects.json").async("string");
            objects = JSON.parse(objectsData).map(obj => ({
                ...obj,
                position: obj.position
                    ? {
                        type: obj.position.type,
                        targetId: obj.position.targetId,
                        x: obj.position.type === "place" ? obj.position.x : undefined,
                        y: obj.position.type === "place" ? obj.position.y : undefined
                    }
                    : null
            }));
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> Objects could not be imported!",
                duration: 3000
            });
        }

        // Import places
        try {
            const placesData = await zipContent.file("places.json").async("string");
            places = JSON.parse(placesData);
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> Places could not be imported!",
                duration: 3000
            });
        }

        // Import timeline
        try {
            const timelineData = await zipContent.file("timeline.json").async("string");
            timeline = JSON.parse(timelineData);
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> Timeline could not be imported!",
                duration: 3000
            });
        }

        // Import events
        try {
            const eventsData = await zipContent.file("events.json").async("string");
            events = JSON.parse(eventsData).map(ev => ({
                ...ev,
                conditions: ev.conditions || []
            }));
        } catch {
            showNotification({
                type: "warning",
                content: "<strong>Warning:</strong> Events could not be imported!",
                duration: 3000
            });
        }

        // Process images from the 'images' folder
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

                        // Attach image to NPC, object, or place based on filename
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

        // Log result in console
        console.log("Import completed:", { npcs, objects, places, timeline });

        // Update UI with newly imported data
        loadMetadata();
        renderNPCListRight();
        renderdivObjectListRight();
        renderdivplaceListRight();
        renderTimeline();
        renderdivEventListRight();
        populateLocationSelect();
        updateTimeDisplay(currentIndex);

        // Set default place
        const defaultPlace = places.find(place => place.default === true) || places[0];
        locationSelect.value = defaultPlace.id;
        locationChanged();
        renderdivInventoryListRight();
        enableDragAndDropTabs();

        // Success notification
        showNotification({
            type: "success",
            content: "<strong>Import successful!</strong> Scenario has been imported!",
            duration: 3000
        });
    } catch (error) {
        console.error("Error during import:", error);
        showNotification({
            type: "error",
            content: "<strong>Error:</strong> An error occurred while importing. Check the ZIP file.",
            duration: 0
        });
    }
}
