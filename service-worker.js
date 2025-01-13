//service-worker.js

const CACHE_NAME = "wiham-cache-v6";
const urlsToCache = [
    "/", // Wurzelverzeichnis
    "/index.html", // Haupt-HTML-Datei
    "/locales.json",
    "/css/style.css", // Haupt-CSS-Datei
    "/js/main.js", // Haupt-JavaScript-Datei
    "/js/data.js",
    "/js/locales.js",
    "/js/meta.js",
    "/js/npcEditor.js",
    "/js/objectEditor.js",
    "/js/eventEditor.js",
    "/js/grid.js",
    "/js/placeEditor.js",
    "/js/timelineEditor.js",
    "/js/editScenario.js",
    "/js/inventory.js",
    "/js/menunavigation.js",
    "/js/export.js",
    "/js/import.js",
    "/js/notification.js",
    "/assets/logo.png",
    "/assets/favicon.ico",
    "/assets/default_place.png", 
    "/assets/default_object.png", 
    "/assets/default_npc.png"
];

// Installations-Event: Dateien im Cache speichern
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Aktivierungs-Event: Alte Caches löschen
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch-Ereignis: Automatische Aktualisierung
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Netzwerkantwort im Cache speichern
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse; // Aktuelle Version aus dem Netzwerk zurückgeben
            })
            .catch(() => {
                // Fallback auf Cache, wenn das Netzwerk nicht verfügbar ist
                return caches.match(event.request).then(cachedResponse => {
                    return cachedResponse || caches.match("/index.html");
                });
            })
    );
});