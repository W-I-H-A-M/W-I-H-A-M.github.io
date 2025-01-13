//menunavigation.js

////////////////////////////
//Variable Initialisierung//
////////////////////////////

//Menu Buttons
const btnScenario = document.getElementById("btnScenario");
const btnNPCs = document.getElementById("btnNPCs");
const btnObjects = document.getElementById("btnObjects");
const btnWorld = document.getElementById("btnWorld");
const btnTimeline = document.getElementById("btnTimeline");
const btnEditScenario = document.getElementById("btnEditScenario");
const btnEvents = document.getElementById("btnEvents");

//Main Container
const divNPCEditor = document.getElementById("divNPCEditor");
const divObjectEditor = document.getElementById("divObjectEditor");
const divPlaceEditor = document.getElementById("divPlaceEditor");
const divTimelineEditor = document.getElementById("divTimelineEditor");
const divEditScenario = document.getElementById("divEditScenario");
const divEventEditor = document.getElementById("divEventEditor");

//Tab Buttons
const tabBtnNPCEditor = document.querySelector('.tab-button[data-tab="tabNPCEditor"]');
const tabBtnObjectEditor = document.querySelector('.tab-button[data-tab="tabObjectEditor"]');
const tabBtnPlaceEditor = document.querySelector('.tab-button[data-tab="tabPlaceEditor"]');
const tabBtnSelected = document.querySelector('.tab-button[data-tab="tabSelected"]');
const tabBtnNPCs = document.querySelector('.tab-button[data-tab="tabNPCs"]');
const tabBtnObjects = document.querySelector('.tab-button[data-tab="tabObjects"]');
const tabBtnAllNPC = document.querySelector('.tab-button[data-tab="tabAllNPC"]');
const tabBtnAllObjects = document.querySelector('.tab-button[data-tab="tabAllObjects"]');
const tabBtnEventEditor = document.querySelector('.tab-button[data-tab="tabEventEditor"]');
const tabBtnMatadata = document.querySelector('.tab-button[data-tab="tabMatadata"]');
const tabBtnInventory = document.querySelector('.tab-button[data-tab="tabInventory"]');

const allTabButtons = document.querySelectorAll("#infoTabs .tab-button");
const tabContents = document.querySelectorAll("#tabContents .tab-content");
const allContainer = [
    divNPCEditor,
    divObjectEditor,
    divPlaceEditor,
    mapContainer,
    divTimelineEditor,
    divEditScenario,
    divEventEditor
];

/////////////////
//Eventlistener//
/////////////////
btnTimeline.addEventListener("click", () => {
    exeptBtns = [
        tabBtnSelected
    ];
    switchMenu (divTimelineEditor,exeptBtns);

    unsavedTimeline = [...timeline];
    renderTimeline();
});

btnWorld.addEventListener("click", () => {
    exeptBtns = [
        tabBtnPlaceEditor
    ];
    switchMenu (divPlaceEditor,exeptBtns);
});

btnNPCs.addEventListener("click", () => {
    exeptBtns = [
        tabBtnNPCEditor
    ];
    switchMenu (divNPCEditor,exeptBtns);
});

btnObjects.addEventListener("click", () => {
    exeptBtns = [
        tabBtnObjectEditor
    ];
    switchMenu (divObjectEditor,exeptBtns);
});

btnEvents.addEventListener("click", () => {
    exeptBtns = [
        tabBtnEventEditor
    ];
    switchMenu (divEventEditor,exeptBtns);
    renderdivEventListRight();
});

btnEditScenario.addEventListener("click", () => {
    exeptBtns = [
        tabBtnAllNPC,
        tabBtnAllObjects,
        tabBtnMatadata
    ];
    editScenarioEnabled = true;
    switchMenu (divEditScenario,exeptBtns);
    loadSelectedPlace(locationSelect.value);
    enableDragAndDropTabs()
});

btnScenario.addEventListener("click", () => {
    exeptBtns = [
        tabBtnSelected,
        tabBtnNPCs,
        tabBtnObjects,
        tabBtnInventory
    ];
    editScenarioEnabled = false;
    switchMenu (mapContainer,exeptBtns);
    loadSelectedPlace(locationSelect.value);
    renderdivInventoryListRight();
});

allTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // 1) Alle Buttons & Inhalte zurücksetzen
        allTabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => (content.style.display = "none"));

        // 2) Diesen Button aktiv setzen
        button.classList.add("active");

        // 3) Entsprechenden Inhalt einblenden
        const targetId = button.getAttribute("data-tab");
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.style.display = "block";
        }
    });
});

/////////////
//Functions//
/////////////

function switchMenu (Container, exeptBtns){
    allContainer.forEach((con) => {
        con.style.display = "none";
    });
    Container.style.display = "block";

    allTabButtons.forEach((btn) => {
        btn.style.display = "none";
    });
    exeptBtns.forEach((btn) => {
        btn.style.display = "inline-block";
    });
    exeptBtns[0].click();
}
