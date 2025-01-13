//export.js

document.getElementById("btnExportScenario").addEventListener("click", () => {
    exportScenario();
    console.log("Szenario-Export gestartet");
});

function generateNPCsJSON() {
    const npcsReturn = npcs.map(npc => {
      return {
        ...npc, // Kopie des NPC-Objekts erstellen
        image: npc.image ? `images/npc_${npc.id}.png` : null
      };
    });
    
    return npcsReturn; // Dieser Array ist "neu" und verändert das Original nicht
  }

function generateTimelineJSON() {
    return timeline.map(entry => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        order: entry.order
    }));
}

function generateObjectsJSON() {
    return objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        image: (obj.image && !obj.image.includes("assets/default_object.png")) 
            ? `images/object_${obj.id}.png` 
            : null, // Exportiere nur, wenn kein Standardbild verwendet wird
        position: obj.position ? {
            type: obj.position.type,
            targetId: obj.position.targetId,
            x: obj.position.type === "place" ? obj.position.x : undefined,
            y: obj.position.type === "place" ? obj.position.y : undefined
        } : null // Keine Position, falls nicht definiert
    }));
}

function generatePlacesJSON() {
    const placesReturn = places.map(place => {
        return {
          ...place, // Kopie des NPC-Objekts erstellen
          image: place.background ? `images/place_${place.id}.png` : null
        };
      });
      
      return places;
}

function exportScenario() {
    const zip = new JSZip();

    // NPCs exportieren
    const npcsData = generateNPCsJSON();
    zip.file("npcs.json", JSON.stringify(npcsData, null, 2));

    // Objekte exportieren
    const objectsData = generateObjectsJSON();
    zip.file("objects.json", JSON.stringify(objectsData, null, 2));

    // Orte exportieren
    const placesData = generatePlacesJSON();
    zip.file("places.json", JSON.stringify(placesData, null, 2));

    // Zeitlinie exportieren
    const timelineData = generateTimelineJSON();
    zip.file("timeline.json", JSON.stringify(timelineData, null, 2));

    // Events exportieren
    zip.file("events.json", JSON.stringify(events, null, 2));

    const metaObj = Object.assign({}, meta);
    zip.file("meta.json", JSON.stringify(metaObj, null, 2));

    // Bilder der NPCs exportieren
    const imagesFolder = zip.folder("images");
    npcs.forEach(npc => {
        if (npc.image && !npc.image.includes("assets/default_object.png")) {
            const base64Data = npc.image.split(",")[1];
            imagesFolder.file(`npc_${npc.id}.png`, base64Data, { base64: true });
        }
    });

    // Bilder der Objekte exportieren
    objects.forEach(obj => {
        if (obj.image && !obj.image.includes("assets/default_object.png")) {
            const base64Data = obj.image.split(",")[1];
            imagesFolder.file(`object_${obj.id}.png`, base64Data, { base64: true });
        }
    });

    // Bilder der Orte exportieren
    places.forEach(place => {
        if (place.background && !place.background.includes("assets/default_object.png")) {
            const base64Data = place.background.split(",")[1];
            imagesFolder.file(`place_${place.id}.png`, base64Data, { base64: true });
        }
    });

    // ZIP-Datei generieren
    zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${meta.name}_${getFormattedTimestamp()}.zip`;
        a.click();
    });
}
function getFormattedTimestamp() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Format: YYYY-MM-DD_HH:MM:SS
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }