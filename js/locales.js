let languages = {};
let currentLanguage = 'de';
let translations = {};

async function loadLanguages() {
    try {
        // Sprachdaten laden
        const response = await fetch('locales.json');
        if (!response.ok) {
            throw new Error(`HTTP-Error: ${response.status}`);
        }

        // JSON-Daten in languages speichern
        languages = await response.json();
        console.log("Geladene Sprachdaten:", languages);

        // Browser-Sprache ermitteln
        const browserLang = getBrowserLanguage();
        console.log("Erkannte Browser-Sprache:", browserLang);

        // Standardsprache setzen: Browser-Sprache oder Englisch als Fallback
        currentLanguage = languages[browserLang] ? browserLang : 'en';

        // Dropdown mit verfügbaren Sprachen befüllen
        populateLanguageSelector(languages);

        // Standardsprache laden
        loadLanguage(currentLanguage, languages);

        // Event-Listener hinzufügen
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;

            if (!languages[selectedLanguage]) {
                console.error(`Ungültige Sprache ausgewählt: '${selectedLanguage}'`);
                return;
            }

            currentLanguage = selectedLanguage;
            loadLanguage(currentLanguage, languages);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Sprachen:", error);
    }
}

function populateLanguageSelector(languages) {
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.innerHTML = "";

    for (const langCode in languages) {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = languages[langCode].languageTitel || langCode;
        languageSelector.appendChild(option);
    }

    // Standardwert setzen
    if (languages[currentLanguage]) {
        languageSelector.value = currentLanguage;
    } else {
        const firstLanguage = Object.keys(languages)[0];
        currentLanguage = firstLanguage;
        languageSelector.value = firstLanguage;
    }
}

function loadLanguage(langCode, languages) {
    if (!languages[langCode]) {
        console.error(`Sprache '${langCode}' nicht gefunden! Verfügbare Sprachen:`, Object.keys(languages));
        return;
    }

    translations = languages[langCode];
    console.log("Geladene Übersetzungen für:", langCode, translations);

    updateTexts();
}

function t(key) {
    return translations[key] || key;
}

function updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// Funktion zum Ermitteln der Browser-Sprache
function getBrowserLanguage() {
    const userLang = navigator.language || navigator.languages[0] || 'en';
    const langCode = userLang.split('-')[0]; // Nur den Sprachcode ohne Region (z. B. 'de' statt 'de-DE')
    return langCode;
}

// Starten beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadLanguages();
});