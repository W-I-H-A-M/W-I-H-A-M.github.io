// **********************************
// DOM Element References and Global State
// **********************************
const btnPlaceBackgroundUpload = document.getElementById("btnPlaceBackgroundUpload");
const inputPlaceBackgroundFile = document.getElementById("inputPlaceBackgroundFile");
const imgPlaceImagePreview = document.getElementById("imgPlaceImagePreview");
const btnPlaceSave = document.getElementById("btnPlaceSave");
const btnPlaceDelete = document.getElementById("btnPlaceDelete");
const btnNewPlace = document.getElementById("btnNewPlace");
const divplaceListRight = document.getElementById("divplaceListRight");

const placeDescriptionEditor = new Quill('#placeDescription', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'blockquote'],
        [{ 'spoiler': true }]
      ]
    }
  });

let currentPlace = null;
let currentEditedPlace = null;

// **********************************
// Event Listeners
// **********************************

/**
 * Opens the file dialog for uploading a place background image.
 */
btnPlaceBackgroundUpload.addEventListener("click", () => {
  inputPlaceBackgroundFile.click();
});

/**
 * Reads the selected background file, converts it to base64,
 * and updates the current place preview image.
 */
inputPlaceBackgroundFile.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64Data = e.target.result;
    currentEditedPlace.background = base64Data;
    imgPlaceImagePreview.src = base64Data;
    imgPlaceImagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

/**
 * Creates a new place object with default values,
 * adds it to the places array, and loads it into the editor.
 */
btnNewPlace.addEventListener("click", () => {
  const newPlace = {
    id: generateID(),
    name: "N/N",
    description: "",
    background: "assets/default_place.png",
    gridSize: { rows: 10, cols: 10 }
  };
  places.push(newPlace);
  renderdivplaceListRight();
  populateLocationSelect();
  currentEditedPlace = newPlace;
  loadPlaceIntoEditor(currentEditedPlace);
});

/**
 * Saves the current place being edited, updates the list and location selector,
 * and provides user feedback.
 */
btnPlaceSave.addEventListener("click", () => {
  try {
    if (!currentEditedPlace) {
      showNotification({
        type: "warning",
        content: "<strong>Warnung:</strong> Kein Ort ausgewählt!",
        duration: 3000
      });
      return;
    }
    savePlaceFromEditor();
    renderdivplaceListRight();
    populateLocationSelect();
    console.log("Ort gespeichert:", currentEditedPlace);
    showNotification({
      type: "success",
      content: "Successfully Saved",
      duration: 1000
    });
  } catch (error) {
    showNotification({
      type: "error",
      content: "<strong>Fehler:</strong> Could not Save.",
      duration: 0
    });
  }
});

/**
 * Deletes the current place if confirmed by the user,
 * clears the editor, and updates the UI.
 */
btnPlaceDelete.addEventListener("click", () => {
  if (!currentEditedPlace) {
    showNotification({
      type: "warning",
      content: "<strong>Warnung:</strong> Kein Ort ausgewählt!",
      duration: 3000
    });
    return;
  }
  const confirmed = confirm(`Möchtest du den Ort "${currentEditedPlace.name}" wirklich löschen?`);
  if (!confirmed) return;

  const index = places.indexOf(currentEditedPlace);
  if (index !== -1) {
    places.splice(index, 1);
    console.log(`Ort gelöscht: ${currentEditedPlace.name}`);
  }
  currentEditedPlace = null;
  clearPlaceEditorFields();
  renderdivplaceListRight();
  populateLocationSelect();
});

// **********************************
// Functions
// **********************************

/**
 * Loads a selected place into the editor fields.
 */
function loadPlaceIntoEditor(place) {
  document.getElementById("placeId").value = place.id || "";
  document.getElementById("placeName").value = place.name || "";
  document.getElementById("placeGridSizeRows").value = place.gridSize.rows || 10;
  document.getElementById("placeGridSizeCols").value = place.gridSize.cols || 10;
  document.getElementById("startPlace").checked = place.default;
  placeDescriptionEditor.root.innerHTML = currentEditedPlace.description;
  
  if (place.background) {
    imgPlaceImagePreview.src = place.background;
    imgPlaceImagePreview.style.display = "block";
  } else {
    imgPlaceImagePreview.src = "";
    imgPlaceImagePreview.style.display = "none";
  }
}

/**
 * Saves the editor form values into the current place object.
 * If 'default' is selected, all other places lose their default status.
 */
function savePlaceFromEditor() {
  currentEditedPlace.name = document.getElementById("placeName").value;
  currentEditedPlace.gridSize.rows = parseInt(document.getElementById("placeGridSizeRows").value, 10);
  currentEditedPlace.gridSize.cols = parseInt(document.getElementById("placeGridSizeCols").value, 10);
  currentEditedPlace.default = document.getElementById("startPlace").checked;
  currentEditedPlace.description = placeDescriptionEditor.root.innerHTML;

  if (currentEditedPlace.default) {
    places.forEach(place => {
      if (place.id !== currentEditedPlace.id) {
        place.default = false;
      }
    });
  }

  const preview = document.getElementById("imgPlaceImagePreview");
  if (preview.src) {
    currentEditedPlace.background = preview.src;
  }
}

/**
 * Renders a list of places, each represented as a card,
 * and attaches a click event to load the place into the editor.
 */
function renderdivplaceListRight() {
  divplaceListRight.innerHTML = "";
  places.forEach(place => {
    const card = renderItemCard(place, "place");
    card.addEventListener("click", () => {
      currentEditedPlace = place;
      loadPlaceIntoEditor(place);
      highlightSelectedItemCard(card);
    });
    divplaceListRight.appendChild(card);
  });
}

/**
 * Clears the place editor fields, resetting them to empty/default values.
 */
function clearPlaceEditorFields() {
  document.getElementById("placeId").value = "";
  document.getElementById("placeName").value = "";
  document.getElementById("placeGridSizeRows").value = "";
  document.getElementById("placeGridSizeCols").value = "";
  document.getElementById("startPlace").checked = false;
  document.getElementById("placeDescription").value = "";
  placeDescriptionEditor.root.innerHTML = ""
  
  if (imgPlaceImagePreview) {
    imgPlaceImagePreview.src = "";
    imgPlaceImagePreview.style.display = "none";
  }
}

/**
 * Highlights the selected place card in the interface.
 */
function highlightinEditorselectedPlace(selectedItemDiv) {
  const allItems = document.querySelectorAll(".placeItemRight");
  allItems.forEach((item) => {
    item.style.border = "1px solid #ccc";
  });
  selectedItemDiv.style.border = "2px solid red";
}
