//objectEditor.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////
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

/////////////////
//Eventlistener//
/////////////////

//Create a new Object and reload gui
btnNewObject.addEventListener("click", () => {
    const newObject = {
        id: generateID(),
        name: "N/N",
        image: "",
        description: "",
    };
    objects.push(newObject);

    renderdivObjectListRight();
    currentObject = newObject;
    loadObjectIntoEditor(currentObject);
});

btnObjectImageUpload.addEventListener("click", () => {
    inputObjectImageFile.click();
});

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


selectObjectPositionType.addEventListener("change", () => {
    updatePositionTargetDropdown(selectObjectPositionType.value);
});

btnObjectSave.addEventListener("click", () => {
    try {
        if (!currentObject) {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Kein Objekt ausgewählt!",
                duration: 3000,
            });
            return;
        }
        saveObjectFromEditor(currentObject);
        console.log("Objekt gespeichert:", currentObject);
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

btnObjectDelete.addEventListener("click", () => {
    if (!currentObject) {
        showNotification({
            type: "warning",
            content: "<strong>Warnung:</strong> Kein Objekt ausgewählt!",
            duration: 3000,
        });
        return;
    }

    const confirmed = confirm(`Möchtest du das Objekt "${currentObject.name}" wirklich löschen?`);
    if (!confirmed) return;

    const index = objects.indexOf(currentObject);
    if (index !== -1) {
        objects.splice(index, 1);
        console.log(`Objekt gelöscht: ${currentObject.name}`);
    }
    currentObject = null;
    clearObjectEditorFields();
    renderdivObjectListRight();
});

/////////////
//Functions//
/////////////

//Create a Preview to select for the editor
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

//Loads the Editor Formular
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

    const selectObjectPositionType = document.getElementById("selectObjectPositionType");
    const selectTarget = document.getElementById("objectPositionTarget");
    const xInput = document.getElementById("objectPositionX");
    const yInput = document.getElementById("objectPositionY");

    if (obj.position) {
        selectObjectPositionType.value = obj.position.type || "none";
        updatePositionTargetDropdown(selectObjectPositionType.value);
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
        selectObjectPositionType.value = "none";
        selectTarget.innerHTML = ""; // Dropdown leeren
        xInput.value = "";
        yInput.value = "";
        xInput.style.display = "none";
        yInput.style.display = "none";
    }
}

//Writes the formular values to the obj and renders the list again.
function saveObjectFromEditor(obj) {
    console.log("Speichern gestartet für:", obj);

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

    console.log("Gespeichertes Objekt:", obj);
    renderdivObjectListRight();
}

//Display position dropdown and Coords formular based on the selected position type
function updatePositionTargetDropdown(type) {
    const selectTarget = document.getElementById("objectPositionTarget");
    const xLabel = document.getElementById("objectPositionXLabel");
    const xInput = document.getElementById("objectPositionX");
    const yLabel = document.getElementById("objectPositionYLabel");
    const yInput = document.getElementById("objectPositionY");

    selectTarget.innerHTML = ""; //empty Dropdown

    if (type === "npc") {
        // Fill Dropdown with NPCs
        npcs.forEach(npc => {
            const option = new Option(npc.name, npc.id);
            selectTarget.add(option);
        });

        // hide coords
        xLabel.style.display = "none";
        xInput.style.display = "none";
        yLabel.style.display = "none";
        yInput.style.display = "none";
    } else if (type === "place") {
        // Fill Dropdown with places
        places.forEach(place => {
            const option = new Option(place.name, place.id);
            selectTarget.add(option);
        });

        // show coords
        xLabel.style.display = "inline";
        xInput.style.display = "inline";
        yLabel.style.display = "inline";
        yInput.style.display = "inline";
    } else {
        // No Type selected
        xLabel.style.display = "none";
        xInput.style.display = "none";
        yLabel.style.display = "none";
        yInput.style.display = "none";
    }
}

//empty the Editor formular
function clearObjectEditorFields() {
    document.getElementById("objectId").value = "";
    document.getElementById("objectName").value = "";
    document.getElementById("objectDescription").value = "";
    const preview = document.getElementById("imgObjectImagePreview");
    preview.src = "";
    preview.style.display = "none";
}
