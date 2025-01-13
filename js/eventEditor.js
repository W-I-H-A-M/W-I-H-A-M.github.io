//EventEditor.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////
const btnNewEvent = document.getElementById("btnNewEvent");
const btnEventSave = document.getElementById("btnEventSave");
const btnEventDelete = document.getElementById("btnEventDelete");
const conditionsList = document.getElementById("conditionsList");
const btnAddCondition = document.getElementById("btnAddCondition");
const eventDescriptionEditor = new Quill('#eventDescription', {
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

//Create a new Event and reload gui
btnNewEvent.addEventListener("click", () => {
    const newEvent = {
        id: generateID(),
        name: "N/N",
        description: "",
    };
    events.push(newEvent);

    renderdivEventListRight();
    currentEvent = newEvent;
    loadEventIntoEditor(currentEvent);
});

// Eventlistener: Neue Bedingung hinzufügen
btnAddCondition.addEventListener("click", () => {
    addCondition();
});


btnEventSave.addEventListener("click", () => {
    try {
        if (!currentEvent) {
            showNotification({
                type: "warning",
                content: "<strong>Warnung:</strong> Kein Event ausgewählt!",
                duration: 3000,
            });
            return;
        }
        saveEventFromEditor(currentEvent);
        console.log("Event gespeichert:", currentEvent);
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

btnEventDelete.addEventListener("click", () => {
    if (!currentEvent) {
        showNotification({
            type: "warning",
            content: "<strong>Warnung:</strong> Kein Event ausgewählt!",
            duration: 3000,
        });
        return;
    }

    const confirmed = confirm(`Möchtest du das Event "${currentEvent.name}" wirklich löschen?`);
    if (!confirmed) return;

    const index = events.indexOf(currentEvent);
    if (index !== -1) {
        events.splice(index, 1);
        console.log(`Event gelöscht: ${currentEvent.name}`);
    }
    currentEvent = null;
    clearEventEditorFields();
    renderdivEventListRight();
});

/////////////
//Functions//
/////////////

//Create a Preview to select for the editor
function renderdivEventListRight() {
    divEventListRight.innerHTML = "";

    events.forEach(event => {
        const card = renderItemCard(event, 'event');
        card.addEventListener('click', () => {
            currentEvent = event;
            loadEventIntoEditor(event);
            highlightSelectedItemCard(card); // Karte hervorheben
        });
        divEventListRight.appendChild(card);
    });
}

//Loads the Editor Formular
function loadEventIntoEditor(ev) {
    document.getElementById("eventId").value = ev.id || "";
    document.getElementById("eventName").value = ev.name || "";
    eventDescriptionEditor.root.innerHTML = ev.description || "";

    // Bedingungen laden
    conditionsList.innerHTML = ""; // Vorhandene Bedingungen entfernen
    if (ev.conditions) {
        ev.conditions.forEach(cond => {
            addCondition(cond.isOr ? "or" : null); // Neue Bedingung hinzufügen
            const lastCondition = conditionsList.lastChild; // Letzte hinzugefügte Bedingung
            if (!lastCondition) return;

            // Prüfen und Werte setzen
            const typeSelect = lastCondition.querySelector("select:nth-of-type(1)");
            const operatorSelect = lastCondition.querySelector("select:nth-of-type(2)");
            const valueSelect = lastCondition.querySelector("select:nth-of-type(3)");

            if (typeSelect) typeSelect.value = cond.type;
            if (operatorSelect) operatorSelect.value = cond.operator;
            if (valueSelect) {
                updateConditionValueDropdown(valueSelect, cond.type);
                valueSelect.value = cond.value;
            }
        });
    }

    // Button für neue Bedingung anzeigen, falls keine vorhanden
    if (conditionsList.children.length === 0) {
        btnAddCondition.style.display = "block";
    }
}

//Writes the formular values to the ev and renders the list again.
function saveEventFromEditor(ev) {
    console.log("Speichern gestartet für:", ev);

    ev.name = document.getElementById("eventName").value;
    ev.description = eventDescriptionEditor.root.innerHTML;

    // Bedingungen speichern
    ev.conditions = [];
    const conditionItems = conditionsList.querySelectorAll(".condition");
    conditionItems.forEach(item => {
        const type = item.querySelector("select:nth-of-type(1)").value; // Erstes Dropdown (Typ)
        const operator = item.querySelector("select:nth-of-type(2)").value; // Zweites Dropdown (Operator)
        const value = item.querySelector("select:nth-of-type(3)").value; // Drittes Dropdown (Wert/Entität)
        const isOr = item.classList.contains("or"); // Prüfen, ob ODER

        ev.conditions.push({ type, operator, value, isOr });
    });

    console.log("Gespeichertes Event:", ev);
    renderdivEventListRight();
}


//empty the Editor formular
function clearEventEditorFields() {
    document.getElementById("eventId").value = "";
    document.getElementById("eventName").value = "";
    document.getElementById("eventDescription").value = "";
}

//highlight one item in the info menu
function highlightSelectedEvent(selectedItemDiv) {
    const allItems = document.querySelectorAll(".eventItemRight");
    allItems.forEach((item) => {
        item.style.border = "1px solid #ccc";
        selectedItemDiv.style.border = "2px solid red";
    })
};

function addCondition(previousOperator = null, insertAfterElement = null) {
    // Verstecke "Neue Bedingung hinzufügen"-Button, wenn Bedingungen hinzugefügt werden
    btnAddCondition.style.display = "none";

    const conditionItem = document.createElement("li");
    conditionItem.className = previousOperator ? "condition or" : "condition";

    // ODER-Label hinzufügen, falls ODER-Bedingung
    if (previousOperator === "or") {
        const orLabel = document.createElement("span");
        orLabel.textContent = "ODER";
        orLabel.style.marginRight = "10px";
        orLabel.style.fontWeight = "bold";
        conditionItem.appendChild(orLabel);
    }

    // Dropdown für Bedingungstyp
    const conditionType = document.createElement("select");
    ["npc", "time", "object", "place"].forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        conditionType.appendChild(option);
    });
    conditionType.addEventListener("change", () => updateConditionValueDropdown(conditionValue, conditionType.value));

    // Dropdown für Operator
    const conditionOperator = document.createElement("select");
    ["=", "!=", ">", "<"].forEach(op => {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op;
        conditionOperator.appendChild(option);
    });

    // Dropdown für Wert/Entität
    const conditionValue = document.createElement("select");
    updateConditionValueDropdown(conditionValue, conditionType.value);

    // UND/ODER Buttons
    const btnAnd = document.createElement("button");
    btnAnd.textContent = "UND";
    btnAnd.addEventListener("click", () => addCondition(null, conditionItem));

    const btnOr = document.createElement("button");
    btnOr.textContent = "ODER";
    btnOr.addEventListener("click", () => addCondition("or", conditionItem));

    // Entfernen Button
    const btnRemove = document.createElement("button");
    btnRemove.textContent = "❌";
    btnRemove.addEventListener("click", () => {
        conditionItem.remove();
        if (conditionsList.children.length === 0) {
            btnAddCondition.style.display = "block"; // Button wieder anzeigen
        }
    });

    // Bedingung zusammenfügen
    conditionItem.appendChild(conditionType);
    conditionItem.appendChild(conditionOperator);
    conditionItem.appendChild(conditionValue);
    if (!previousOperator) {
        conditionItem.appendChild(btnAnd);
        conditionItem.appendChild(btnOr);
    }
    conditionItem.appendChild(btnRemove);

    // Bedingung an der richtigen Stelle einfügen
    if (insertAfterElement) {
        insertAfterElement.after(conditionItem);
    } else {
        conditionsList.appendChild(conditionItem);
    }
}

function updateConditionValueDropdown(dropdown, type) {
    dropdown.innerHTML = ""; // Dropdown leeren

    let options = [];
    if (type === "npc") {
        options = npcs.map(npc => ({ value: npc.id, label: npc.name }));
    } else if (type === "place") {
        options = places.map(place => ({ value: place.id, label: place.name }));
    } else if (type === "object") {
        options = objects.map(obj => ({ value: obj.id, label: obj.name }));
    } else if (type === "time") {
        options = timeline.map(entry => ({ value: entry.id, label: entry.title }));
    }

    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        dropdown.appendChild(opt);
    });
}

function evaluateCondition(condition, context) {
    const { type, operator, value } = condition;

    switch (type) {
        case "npc":
            const npcOnGrid = context.npcs.some(npc => npc.id === value);
            return operator === "=" ? npcOnGrid : !npcOnGrid;
        case "time":
            const currentOrder = context.timeOrder; // Verwende die aktuelle Order
            const targetOrder = timeline.find(entry => entry.id === value)?.order;

            if (targetOrder === undefined) return false; // Fehlerhaftes Ziel

            if (operator === "=") return currentOrder === targetOrder;
            if (operator === "!=") return currentOrder !== targetOrder;
            if (operator === ">") return currentOrder > targetOrder;
            if (operator === "<") return currentOrder < targetOrder;
            break;
        case "object":
            const objectExists = context.objects.some(obj => obj.id === value);
            return operator === "=" ? objectExists : !objectExists;
        case "place":
            const currentPlace = context.place;
            return operator === "=" ? currentPlace === value : currentPlace !== value;
        default:
            return false;
    }
}

function evaluateEventConditions(event, context) {
    const groups = [];
    let currentGroup = [];

    // 1. Bedingungen in Gruppen unterteilen
    event.conditions.forEach((condition) => {
        if (!condition.isOr) {
            // Neue Gruppe starten, wenn `isOr: false`
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [condition];
        } else {
            // `isOr: true` → Zur aktuellen Gruppe hinzufügen
            currentGroup.push(condition);
        }
    });

    // Letzte Gruppe hinzufügen
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    console.log("Gruppen:", groups);

    // 2. Gruppen evaluieren
    const groupResults = groups.map((group) => {
        // Eine Gruppe evaluieren
        return group.some((condition) => evaluateCondition(condition, context));
    });

    console.log("Gruppenergebnisse:", groupResults);

    // 3. Ergebnisse der Gruppen mit AND verknüpfen
    return groupResults.every((result) => result);
}



function checkAndNotifyEvents(events, context) {
    events.forEach(event => {
        if (evaluateEventConditions(event, context)) {
            showNotification({
                type: "info",
                content: `${event.name}<br\>${event.description?.replace(/\n/g, "<br>")}`,
                duration: 0
            });
        }
    });
}

function updateAndCheckEvents() {
    const context = {
        npcs: npcs.filter(npc =>
            npc.schedule.some(entry =>
                entry.placeId === currentPlace &&
                entry.timeStart === timeline[currentIndex]?.id
            )
        ), // NPCs auf dem Grid
        timeOrder: timeline[currentIndex]?.order, // Aktuelle Zeit
        objects: objects.filter(obj => obj.position === null), // Objekte ohne Position
        place: currentPlace // Aktueller Ort
    };

    checkAndNotifyEvents(events, context);
}