// *****************************************
// DOM Element References and Global State
// *****************************************
const btnNewObject = document.getElementById("btnNewObject");
const btnObjectImageUpload = document.getElementById("btnObjectImageUpload");
const inputObjectImageFile = document.getElementById("inputObjectImageFile");
const selectObjectPositionType = document.getElementById("selectObjectPositionType");
const btnObjectSave = document.getElementById("btnObjectSave");
const btnObjectDelete = document.getElementById("btnObjectDelete");

const objectDescriptionEditor = new Quill('#objectDescription', {
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

let currentObject = null; // Stores the currently selected object

// *****************************************
// Event Listeners
// *****************************************

/**
 * Creates a new object, adds it to the global 'objects' list,
 * and immediately loads it into the editor.
 */
btnNewObject.addEventListener("click", () => {
  const newObject = {
    id: generateID(),
    name: "N/N",
    image: "",
    description: ""
  };
  objects.push(newObject);
  renderdivObjectListRight();
  currentObject = newObject;
  loadObjectIntoEditor(currentObject);
});

/**
 * Opens the file selection dialog to choose an image for the object.
 */
btnObjectImageUpload.addEventListener("click", () => {
  inputObjectImageFile.click();
});

/**
 * Reads the selected image file, converts it to base64,
 * and updates the preview and the object’s image field.
 */
inputObjectImageFile.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64Data = e.target.result;
    if (currentObject) {
      currentObject.image = base64Data;
    }
    imgObjectImagePreview.src = base64Data;
    imgObjectImagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

/**
 * Adjusts the available position fields based on the user’s selection
 * (none, npc, place) and refreshes the dropdown.
 */
selectObjectPositionType.addEventListener("change", () => {
  updatePositionTargetDropdown(selectObjectPositionType.value);
});

/**
 * Saves the current object’s editor data back to the object array.
 * If no object is currently selected, displays a warning.
 */
btnObjectSave.addEventListener("click", () => {
  try {
    if (!currentObject) {
      showNotification({
        type: "warning",
        content: "<strong>Warning:</strong> No object selected!",
        duration: 3000
      });
      return;
    }
    saveObjectFromEditor(currentObject);
    console.log("Object saved:", currentObject);
    showNotification({
      type: "success",
      content: "Successfully Saved",
      duration: 1000
    });
  } catch (error) {
    showNotification({
      type: "error",
      content: "<strong>Error:</strong> Could not Save.",
      duration: 0
    });
  }
});

/**
 * Deletes the current object from the global 'objects' list
 * after user confirmation, then clears the editor.
 */
btnObjectDelete.addEventListener("click", () => {
  if (!currentObject) {
    showNotification({
      type: "warning",
      content: "<strong>Warning:</strong> No object selected!",
      duration: 3000
    });
    return;
  }

  const confirmed = confirm(`Do you really want to delete the object "${currentObject.name}"?`);
  if (!confirmed) return;

  const index = objects.indexOf(currentObject);
  if (index !== -1) {
    objects.splice(index, 1);
    console.log(`Object deleted: ${currentObject.name}`);
  }
  currentObject = null;
  clearObjectEditorFields();
  renderdivObjectListRight();
});

// *****************************************
// Functions
// *****************************************

/**
 * Renders the object list in the UI’s right panel and attaches
 * click events to load each object into the editor.
 */
function renderdivObjectListRight() {
  divObjectListRight.innerHTML = "";
  objects.forEach(obj => {
    const card = renderItemCard(obj, 'object');
    card.addEventListener('click', () => {
      currentObject = obj;
      loadObjectIntoEditor(obj);
      highlightSelectedItemCard(card);
    });
    divObjectListRight.appendChild(card);
  });
}

/**
 * Loads the given object’s data (ID, name, description, image)
 * into the editor fields and updates the preview elements.
 */
function loadObjectIntoEditor(obj) {
  document.getElementById("objectId").value = obj.id || "";
  document.getElementById("objectName").value = obj.name || "";
  objectDescriptionEditor.root.innerHTML = obj.description || "";

  const preview = document.getElementById("imgObjectImagePreview");
  if (obj.image) {
    preview.src = obj.image;
    preview.style.display = "inline-block";
  } else {
    preview.src = "assets/default_object.png";
    preview.style.display = "inline-block";
  }

  const selectPositionType = document.getElementById("selectObjectPositionType");
  const selectTarget = document.getElementById("objectPositionTarget");
  const xInput = document.getElementById("objectPositionX");
  const yInput = document.getElementById("objectPositionY");

  if (obj.position) {
    selectPositionType.value = obj.position.type || "none";
    updatePositionTargetDropdown(selectPositionType.value);
    selectTarget.value = obj.position.targetId || "";
    if (obj.position.type === "place") {
      xInput.value = obj.position.x || 0;
      yInput.value = obj.position.y || 0;
      xInput.style.display = "inline";
      yInput.style.display = "inline";
    } else {
      xInput.value = "";
      yInput.value = "";
      xInput.style.display = "none";
      yInput.style.display = "none";
    }
  } else {
    selectPositionType.value = "none";
    selectTarget.innerHTML = "";
    xInput.value = "";
    yInput.value = "";
    xInput.style.display = "none";
    yInput.style.display = "none";
  }
}

/**
 * Reads all editor fields and saves them back to the given object,
 * updating position data (type, target, x, y) if applicable.
 */
function saveObjectFromEditor(obj) {
  obj.name = document.getElementById("objectName").value;
  obj.description = objectDescriptionEditor.root.innerHTML;
  const preview = document.getElementById("imgObjectImagePreview");

  if (preview.src) {
    obj.image = preview.src;
  }

  const positionType = document.getElementById("selectObjectPositionType").value;
  const positionTarget = document.getElementById("objectPositionTarget").value;
  const xInput = document.getElementById("objectPositionX");
  const yInput = document.getElementById("objectPositionY");

  if (positionType === "place") {
    obj.position = {
      type: positionType,
      targetId: positionTarget,
      x: parseInt(xInput.value, 10) || 0,
      y: parseInt(yInput.value, 10) || 0
    };
  } else if (positionType === "npc") {
    obj.position = {
      type: positionType,
      targetId: positionTarget
    };
  } else {
    obj.position = null;
  }
  renderdivObjectListRight();
}

/**
 * Dynamically updates the dropdown for NPCs/Places and shows/hides
 * coordinate fields based on the selected position type.
 */
function updatePositionTargetDropdown(type) {
  const selectTarget = document.getElementById("objectPositionTarget");
  const xLabel = document.getElementById("objectPositionXLabel");
  const xInput = document.getElementById("objectPositionX");
  const yLabel = document.getElementById("objectPositionYLabel");
  const yInput = document.getElementById("objectPositionY");

  selectTarget.innerHTML = "";

  if (type === "npc") {
    npcs.forEach(npc => {
      const option = new Option(npc.name, npc.id);
      selectTarget.add(option);
    });
    xLabel.style.display = "none";
    xInput.style.display = "none";
    yLabel.style.display = "none";
    yInput.style.display = "none";
  } else if (type === "place") {
    places.forEach(place => {
      const option = new Option(place.name, place.id);
      selectTarget.add(option);
    });
    xLabel.style.display = "inline";
    xInput.style.display = "inline";
    yLabel.style.display = "inline";
    yInput.style.display = "inline";
  } else {
    xLabel.style.display = "none";
    xInput.style.display = "none";
    yLabel.style.display = "none";
    yInput.style.display = "none";
  }
}

/**
 * Clears the object editor form fields for ID, name, description, and preview.
 */
function clearObjectEditorFields() {
  document.getElementById("objectId").value = "";
  document.getElementById("objectName").value = "";
  document.getElementById("objectDescription").value = "";
  const preview = document.getElementById("imgObjectImagePreview");
  preview.src = "";
  preview.style.display = "none";
}
