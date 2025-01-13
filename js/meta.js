// References to DOM elements and a pattern to detect forbidden characters
const txtMetaScenarioName = document.getElementById("txtMetaScenarioName");
const txtMetaCreator = document.getElementById("txtMetaCreator");
const txtMeatPlot = document.getElementById("txtMeatPlot");
const MetaSelectRuleset = document.getElementById("MetaSelectRuleset");
const forbiddenChars = /[\\/:*?"<>|]/g;
const errorMessage = document.getElementById("errorMessage");

// Initialize a Quill editor for the plot field
const plotEditor = new Quill("#txtMeatPlot", {
    theme: "snow",
    modules: {
        toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote"],
            [{ spoiler: true }],
        ],
    },
});

// Listen for changes in the scenario name field to update metadata
txtMetaScenarioName.addEventListener("change", () => {
    saveMetadata();
});

// Monitor scenario name input for forbidden characters; remove them if present
txtMetaScenarioName.addEventListener("input", (event) => {
    let currentValue = event.target.value;
    if (forbiddenChars.test(currentValue)) {
        errorMessage.style.display = "block";
        currentValue = currentValue.replace(forbiddenChars, "");
        event.target.value = currentValue;
    } else {
        errorMessage.style.display = "none";
    }
});

// Listen for changes in the creator name field to update metadata
txtMetaCreator.addEventListener("change", () => {
    saveMetadata();
});

// Listen for changes in the plot editor to update metadata
txtMeatPlot.addEventListener("change", () => {
    saveMetadata();
});

// Listen for changes in the ruleset dropdown to update metadata
MetaSelectRuleset.addEventListener("change", () => {
    saveMetadata();
});

/**
 * Saves the current metadata into the global 'meta' object.
 */
function saveMetadata() {
    meta.name = txtMetaScenarioName.value;
    meta.creator = txtMetaCreator.value;
    meta.plot = plotEditor.root.innerHTML;
    meta.ruleset = MetaSelectRuleset.value;
}

/**
 * Loads metadata from the global 'meta' object into form fields and the plot editor.
 */
function loadMetadata() {
    txtMetaScenarioName.value = meta.name;
    txtMetaCreator.value = meta.creator;
    plotEditor.root.innerHTML = meta.plot;
    MetaSelectRuleset.value = meta.ruleset;
}
