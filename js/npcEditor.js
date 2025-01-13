//npcEditor.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////

const txtNPCId = document.getElementById("txtNPCId");
const txtNPCName = document.getElementById("txtNPCName");
const txtNPCDescription = document.getElementById("txtNPCDescription");
const btnNPCImageUpload = document.getElementById("btnNPCImageUpload");
const inputNPCImageFile = document.getElementById("inputNPCImageFile");
const imgNPCImagePreview = document.getElementById("imgNPCImagePreview");
const npcScheduleTableBody = document.querySelector("#npcScheduleTable tbody");
const txtNPCProfession = document.getElementById("txtNPCProfession");
const numNPCMaxHP = document.getElementById("numNPCMaxHP");
const numNPCCurrentHP = document.getElementById("numNPCCurrentHP");
const numNPCMentalMaxHP = document.getElementById("numNPCMentalMaxHP");
const numNPCMentalCurrentHP = document.getElementById("numNPCMentalCurrentHP");
const txtNPCAppearance = document.getElementById("txtNPCAppearance");


const btnNPCScheduleAdd = document.getElementById("btnNPCScheduleAdd");
const btnNPCSave = document.getElementById("btnNPCSave");
const btnNewNPC = document.getElementById("btnNewNPC");
const btnNPCDelete = document.getElementById("btnNPCDelete");
const btnAddEntry = document.querySelectorAll('.btnAddEntry');

let inEditorselectedNPC = null;

const npcDescriptionEditor = new Quill('#txtNPCDescription', {
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

const npcAppearanceEditor = new Quill('#txtNPCAppearance', {
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

btnAddEntry.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        addEntryRow(category);
    });
});

btnNewNPC.addEventListener("click", () => {
    const newNpc = {
        id: generateID(),
        name: "N/N",
        profession: "",
        image: "",
        appearance: "",
        description: "",
        schedule: []
    };
    npcs.push(newNpc);
    renderNPCListRight();
    inEditorselectedNPC = newNpc;
    loadNPCIntoEditor(inEditorselectedNPC);
    console.log("Neuer NPC hinzugefügt:", newNpc);
});

btnNPCDelete.addEventListener("click", () => {
    deleteNPC(inEditorselectedNPC);
});

btnNPCSave.addEventListener("click", () => {
    try {

        if (!inEditorselectedNPC) {
            inEditorselectedNPC = {
                id: generateID(),
                schedule: [],
            };
            npcs.push(inEditorselectedNPC);
        }
        saveNPCFromEditor(inEditorselectedNPC);
        console.log("NPC gespeichert:", inEditorselectedNPC);

        renderNPCListRight();
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


btnNPCImageUpload.addEventListener("click", () => {
    inputNPCImageFile.click();
});

inputNPCImageFile.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Data = e.target.result;

        if (inEditorselectedNPC) {
            inEditorselectedNPC.image = base64Data;
        }

        imgNPCImagePreview.src = base64Data;
        imgNPCImagePreview.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
});

btnNPCScheduleAdd.addEventListener("click", () => {
    addScheduleRow();
});

/////////////
//Functions//
/////////////
function addEntryRow(category) {
    const container = document.querySelector(`#category${category} .entries`);
    const row = document.createElement('div');
    row.className = 'entry-row';

    row.innerHTML = `
      <input type="text" placeholder="Entry Name">
      <input type="number" class="points" min="0" value="0">
      <input type="number" class="bonus" value="0" disabled>
      <input type="number" class="total" value="0" disabled>
      <button class="btnDeleteEntry">❌</button>
    `;

    // Event-Listener für das Punkte-Feld
    row.querySelector('.points').addEventListener('input', () => updateCategoryTotals(category));

    // Event-Listener für den Löschen-Button
    row.querySelector('.btnDeleteEntry').addEventListener('click', () => {
        row.remove();
        updateCategoryTotals(category);
    });

    container.appendChild(row);
}

function updateCategoryTotals(category) {
    const container = document.querySelector(`#category${category}`);
    const pointsInputs = container.querySelectorAll('.points');
    const bonusInputs = container.querySelectorAll('.bonus');
    const totalInputs = container.querySelectorAll('.total');
    const powerPointsDisplay = document.getElementById(`powerPoints${category}`);
    const bonusPointsDisplay = document.getElementById(`bonusPoints${category}`); // Bonuspunkte direkt hinter der Kategorieüberschrift

    // Bonuspunkte für die Kategorie berechnen
    const bonusPoints = calculateBonusPoints(category); // Beispiel: 10% der Gesamtpunkte
    const powerBonusPoints = Math.ceil(calculateBonusPoints(category) * 0.1); // ⚡ Punkte für die Kategorie

    // Bonuspunkte auf der Kategorienebene anzeigen
    if (bonusPointsDisplay) {
        bonusPointsDisplay.textContent = `+ ${bonusPoints}`;
    }

    // ⚡ Punkte anzeigen
    powerPointsDisplay.textContent = `⚡ ${powerBonusPoints}`;

    // Bonuspunkte und Gesamtpunkte pro Attribut in der Tabelle aktualisieren
    pointsInputs.forEach((input, index) => {
        const points = parseInt(input.value, 10) || 0;
        bonusInputs[index].value = bonusPoints; // Kategorie-Bonuspunkte setzen
        totalInputs[index].value = points + bonusPoints; // Total = Punkte + Bonus
    });
}

//loads NPC into editor formular
function loadNPCIntoEditor(npc) {
    txtNPCId.value = npc.id || "";
    txtNPCName.value = npc.name || "";
    npcDescriptionEditor.root.innerHTML = npc.description || "";
    txtNPCProfession.value = npc.profession;
    npcAppearanceEditor.root.innerHTML = npc.appearance;
    numNPCMaxHP.value = npc.maxHP;
    numNPCCurrentHP.value = npc.currentHP;
    numNPCMentalMaxHP.value = npc.maxMentalHP;
    numNPCMentalCurrentHP.value = npc.currentMentalHP;

    loadCategoryAttributes('Physical', npc.attributes?.Physical.entries || []);
    updateCategoryTotals('Physical'); // Bonuspunkte und ⚡ für Kategorie aktualisieren

    loadCategoryAttributes('Knowledge', npc.attributes?.Knowledge.entries || []);
    updateCategoryTotals('Knowledge');

    loadCategoryAttributes('Social', npc.attributes?.Social.entries || []);
    updateCategoryTotals('Social');

    // create Schedule table
    npcScheduleTableBody.innerHTML = "";
    if (npc.schedule && npc.schedule.length > 0) {
        npc.schedule.forEach(entry => {
            addScheduleRow(entry);
        });
    }

    if (npc.image) {
        imgNPCImagePreview.src = npc.image;
        imgNPCImagePreview.style.display = "inline-block";
    } else {
        imgNPCImagePreview.src = "";
        imgNPCImagePreview.style.display = "none";
    }
}

//Saves values from formular into npc variable
function saveNPCFromEditor(npc) {
    npc.id = txtNPCId.value;
    npc.name = txtNPCName.value;
    npc.description = npcDescriptionEditor.root.innerHTML;
    npc.profession = txtNPCProfession.value;
    npc.appearance = npcAppearanceEditor.root.innerHTML;
    npc.maxHP = numNPCMaxHP.value;
    npc.currentHP = numNPCCurrentHP.value;
    npc.maxMentalHP = numNPCMentalMaxHP.value;
    npc.currentMentalHP = numNPCMentalCurrentHP.value;

    npc.attributes = {
        Physical: {
            entries: getCategoryAttributes('Physical'),
            powerPoints: getPowerPoints('Physical'),
            bonusPoints: calculateBonusPoints('Physical') // Bonuspunkte speichern
        },
        Knowledge: {
            entries: getCategoryAttributes('Knowledge'),
            powerPoints: getPowerPoints('Knowledge'),
            bonusPoints: calculateBonusPoints('Knowledge')
        },
        Social: {
            entries: getCategoryAttributes('Social'),
            powerPoints: getPowerPoints('Social'),
            bonusPoints: calculateBonusPoints('Social')
        }
    };

    // read schedule from each table row
    npc.schedule = [];
    const rows = npcScheduleTableBody.querySelectorAll("tr");
    rows.forEach(row => {
        const startVal = row.querySelector(".schedStart").value;
        const placeVal = row.querySelector(".schedPlace").value;
        const xVal = row.querySelector(".schedX").value;
        const yVal = row.querySelector(".schedY").value;

        const scheduleEntry = {
            timeStart: startVal,
            placeId: placeVal,
            row: parseInt(yVal, 10) || 0,
            col: parseInt(xVal, 10) || 0
        };

        npc.schedule.push(scheduleEntry);
    });

    console.log("NPC gespeichert:", npc);
}

function calculateBonusPoints(category) {
    const pointsInputs = document.querySelectorAll(`#category${category} .points`);
    let totalPoints = 0;

    pointsInputs.forEach(input => {
        totalPoints += parseInt(input.value, 10) || 0;
    });
    totalPoints = Math.floor(totalPoints / 10)
    if (totalPoints > 30){
        totalPoints = 30
    }
    return totalPoints; // Beispiel: 10% der Gesamtpunkte
}

function updatePowerPointsDisplay(category, powerPoints) {
    const powerPointsDisplay = document.getElementById(`powerPoints${category}`);
    powerPointsDisplay.textContent = `⚡ ${powerPoints}`;
}

function getPowerPoints(category) {
    const powerPointsDisplay = document.getElementById(`powerPoints${category}`);
    return parseInt(powerPointsDisplay.textContent.replace('⚡ ', ''), 10) || 0;
}

function loadCategoryAttributes(category, attributes) {
    const container = document.querySelector(`#category${category} .entries`);
    container.innerHTML = ''; // Vorhandene Einträge löschen

    attributes.forEach(attr => {
        const row = document.createElement('div');
        row.className = 'entry-row';

        row.innerHTML = `
        <input type="text" value="${attr.name}">
        <input type="number" class="points" value="${attr.points}">
        <input type="number" class="bonus" value="${attr.bonus}" disabled>
        <input type="number" class="total" value="${attr.total}" disabled>
        <button class="btnDeleteEntry">❌</button>
      `;

        // Event-Listener für das Punkte-Feld
        row.querySelector('.points').addEventListener('input', () => updateCategoryTotals(category));

        // Event-Listener für den Löschen-Button
        row.querySelector('.btnDeleteEntry').addEventListener('click', () => {
            row.remove();
            updateCategoryTotals(category);
        });

        container.appendChild(row);
    });

    updateCategoryTotals(category);
}

function getCategoryAttributes(category) {
    const container = document.querySelector(`#category${category} .entries`);
    const rows = container.querySelectorAll('.entry-row');

    return Array.from(rows).map(row => {
        return {
            name: row.querySelector('input[type="text"]').value,
            points: parseInt(row.querySelector('.points').value, 10) || 0,
            bonus: parseInt(row.querySelector('.bonus').value, 10) || 0,
            total: parseInt(row.querySelector('.total').value, 10) || 0,
        };
    });
}

//adds a row into the schedule
function addScheduleRow(entry = {}) {
    const tr = document.createElement("tr");

    // Starttime (Dropdown)
    const tdStart = document.createElement("td");
    const selectStart = document.createElement("select");
    selectStart.className = "schedStart";

    timeline.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.title;
        if (item.id === entry.timeStart) {
            option.selected = true;
        }
        selectStart.appendChild(option);
    });
    tdStart.appendChild(selectStart);
    tr.appendChild(tdStart);

    // place (Dropdown)
    const tdPlace = document.createElement("td");
    const selectPlace = document.createElement("select");
    selectPlace.className = "schedPlace";

    places.forEach(place => {
        const option = document.createElement("option");
        option.value = place.id;
        option.textContent = place.name;
        if (place.id === entry.placeId) {
            option.selected = true;
        }
        selectPlace.appendChild(option);
    });
    tdPlace.appendChild(selectPlace);
    tr.appendChild(tdPlace);

    // X
    const tdX = document.createElement("td");
    const inputX = document.createElement("input");
    inputX.type = "number";
    inputX.className = "schedX";
    inputX.value = entry.col ?? 0;
    tdX.appendChild(inputX);
    tr.appendChild(tdX);

    // Y
    const tdY = document.createElement("td");
    const inputY = document.createElement("input");
    inputY.type = "number";
    inputY.className = "schedY";
    inputY.value = entry.row ?? 0;
    tdY.appendChild(inputY);
    tr.appendChild(tdY);

    // Delete/Remove Button
    const tdRemove = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.addEventListener("click", () => {
        tr.remove();
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdRemove);

    // add new row to table body
    npcScheduleTableBody.appendChild(tr);

}

//renders short preview to select in editor
function renderNPCListRight() {
    const container = document.getElementById("npcListRight");
    container.innerHTML = "";

    npcs.forEach((npc) => {
        const card = renderItemCard(npc, 'npc');
        card.addEventListener('click', () => {
            inEditorselectedNPC = npc;
            loadNPCIntoEditor(npc);
            highlightSelectedItemCard(card);
        });
        container.appendChild(card);
    });
}



//delete an NPC
function deleteNPC(npc) {
    // Confirmation
    const confirmed = window.confirm(`Möchtest du "${npc.name || 'diesen NPC'}" wirklich löschen?`);

    if (!confirmed) {
        console.log("Löschen abgebrochen.");
        return;
    }

    const index = npcs.indexOf(npc);
    if (index !== -1) {
        npcs.splice(index, 1);
    }
    console.log("NPC gelöscht:", npc.name);

    renderNPCListRight();
    clearNPCEditorFields()
}

//empty editor formular
function clearNPCEditorFields() {
    txtNPCId.value = "";
    txtNPCName.value = "";
    txtNPCDescription.value = "";
    imgNPCImagePreview.src = "";
    imgNPCImagePreview.style.display = "none";
    npcScheduleTableBody.innerHTML = "";
}