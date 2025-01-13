//meta.js
const txtMetaScenarioName = document.getElementById("txtMetaScenarioName");
const txtMetaCreator = document.getElementById("txtMetaCreator");
const txtMeatPlot = document.getElementById("txtMeatPlot");
const MetaSelectRuleset = document.getElementById("MetaSelectRuleset");
const forbiddenChars = /[\\/:*?"<>|]/g;
const errorMessage = document.getElementById('errorMessage');
const plotEditor = new Quill('#txtMeatPlot', {
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

txtMetaScenarioName.addEventListener("change",() =>{
    saveMetadata();
})

txtMetaScenarioName.addEventListener('input', (event) => {
    let currentValue = event.target.value;

    // Prüfen, ob verbotene Zeichen enthalten sind
    if (forbiddenChars.test(currentValue)) {
      // Zeige Hinweis an
      errorMessage.style.display = 'block';

      // Alle verbotenen Zeichen entfernen
      currentValue = currentValue.replace(forbiddenChars, '');
      event.target.value = currentValue;
    } else {
      // Keine verbotenen Zeichen => Hinweis ausblenden
      errorMessage.style.display = 'none';
    }
  });

txtMetaCreator.addEventListener("change",() =>{
    saveMetadata();
})

txtMeatPlot.addEventListener("change",() =>{
    saveMetadata();
})

MetaSelectRuleset.addEventListener("change",() =>{
    saveMetadata();
})

function saveMetadata(){
    meta.name = txtMetaScenarioName.value;
    meta.creator = txtMetaCreator.value;
    meta.plot = plotEditor.root.innerHTML;
    meta.ruleset = MetaSelectRuleset.value;
}

function loadMetadata(){
    txtMetaScenarioName.value = meta.name;
    txtMetaCreator.value = meta.creator;
    plotEditor.root.innerHTML = meta.plot;
    MetaSelectRuleset.value = meta.ruleset;
}