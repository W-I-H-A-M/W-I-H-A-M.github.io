//placeEditor.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////
const btnPlaceBackgroundUpload = document.getElementById("btnPlaceBackgroundUpload");
const inputPlaceBackgroundFile = document.getElementById("inputPlaceBackgroundFile");
const imgPlaceImagePreview = document.getElementById("imgPlaceImagePreview");
const btnPlaceSave = document.getElementById("btnPlaceSave");
const btnPlaceDelete = document.getElementById("btnPlaceDelete");
const btnNewPlace = document.getElementById("btnNewPlace");
const divplaceListRight = document.getElementById("divplaceListRight");


let currentPlace = null;
let currentEditedPlace = null;

/////////////////
//Eventlistener//
/////////////////
btnPlaceBackgroundUpload.addEventListener("click", () => {
    inputPlaceBackgroundFile.click();
});

inputPlaceBackgroundFile.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Data = e.target.result;
        currentEditedPlace.background = base64Data;

        // Vorschau anzeigen
        imgPlaceImagePreview.src = base64Data;
        imgPlaceImagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

btnNewPlace.addEventListener("click", () => {
    const newPlace = {
        id: generateID(),
        name: "N/N",
        background: "assets/default_place.png",
        gridSize: { rows: 10, cols: 10 }
    };
    places.push(newPlace);

    renderdivplaceListRight(); // Liste aktualisieren
    populateLocationSelect(); // Combobox aktualisieren
    currentEditedPlace = newPlace;
    loadPlaceIntoEditor(currentEditedPlace); // Direkt ins Formular laden
});

btnPlaceSave.addEventListener("click", () => {
    try {
        if (!currentEditedPlace) {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Kein Ort ausgewählt!",
                duration: 3000,
            });
            return;
        }
        savePlaceFromEditor();
        renderdivplaceListRight();
        populateLocationSelect(); // Combobox aktualisieren
        console.log("Ort gespeichert:", currentEditedPlace);
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

btnPlaceDelete.addEventListener("click", () => {
    if (!currentEditedPlace) {
        showNotification({
            type: "warning",
            content: "<strong>Warnung:</strong> Kein Ort ausgewählt!",
            duration: 3000,
        });
        return;
    }

    const confirmed = confirm(`Möchtest du den Ort "${currentEditedPlace.name}" wirklich löschen?`);
    if (!confirmed) return;

    // Ort aus der Liste entfernen
    const index = places.indexOf(currentEditedPlace);
    if (index !== -1) {
        places.splice(index, 1);
        console.log(`Ort gelöscht: ${currentEditedPlace.name}`);
    }

    // Editor leeren
    currentEditedPlace = null;
    clearPlaceEditorFields();

    // Liste und ComboBox aktualisieren
    renderdivplaceListRight();
    populateLocationSelect();
});

/////////////
//Functions//
/////////////

//Load Place into editor
function loadPlaceIntoEditor(place) {
    document.getElementById("placeId").value = place.id || "";
    document.getElementById("placeName").value = place.name || "";
    document.getElementById("placeGridSizeRows").value = place.gridSize.rows || 10;
    document.getElementById("placeGridSizeCols").value = place.gridSize.cols || 10;
    document.getElementById("startPlace").checked = place.default
    if (place.background) {
        imgPlaceImagePreview.src = place.background;
        imgPlaceImagePreview.style.display = "block";
    } else {
        imgPlaceImagePreview.src = "";
        imgPlaceImagePreview.style.display = "none";
    }
}

//save formular values into Place
function savePlaceFromEditor() {
    currentEditedPlace.name = document.getElementById("placeName").value;
    currentEditedPlace.gridSize.rows = parseInt(document.getElementById("placeGridSizeRows").value, 10);
    currentEditedPlace.gridSize.cols = parseInt(document.getElementById("placeGridSizeCols").value, 10);
    currentEditedPlace.default = document.getElementById("startPlace").checked

    if (currentEditedPlace.default){
        places.forEach(place => {
            if(place.id != currentEditedPlace.id){
                place.default = false;
            }
        });
    }

    const preview = document.getElementById("imgPlaceImagePreview");
    if (preview.src) {
        currentEditedPlace.background = preview.src;
    }
}

//Display place preview for editor selection
function renderdivplaceListRight() {
    divplaceListRight.innerHTML = "";

    places.forEach(place => {
        const card = renderItemCard(place, 'place');
        card.addEventListener('click', () => {
            currentEditedPlace = place;
            loadPlaceIntoEditor(place);
            highlightSelectedItemCard(card); // Karte hervorheben
        });
        divplaceListRight.appendChild(card);
    });
}

//clear formular
function clearPlaceEditorFields() {
    document.getElementById("placeId").value = "";
    document.getElementById("placeName").value = "";
    document.getElementById("placeGridSizeRows").value = "";
    document.getElementById("placeGridSizeCols").value = "";
    document.getElementById("startPlace").checked = false;
    if (imgPlaceImagePreview) {
        imgPlaceImagePreview.src = "";
        imgPlaceImagePreview.style.display = "none";
    }
}

//highlight selected Place
function highlightinEditorselectedPlace(selectedItemDiv) {
    const allItems = document.querySelectorAll(".placeItemRight");
    allItems.forEach((item) => {
        item.style.border = "1px solid #ccc";
    });
    selectedItemDiv.style.border = "2px solid red";
}