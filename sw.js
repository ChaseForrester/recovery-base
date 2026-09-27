const CACHE = "recovery-base-v2";
const PRECACHE = [
    "/",
    "/index.html",
    "/about.html",
    "/memberships.html",
    "/book.html",
    "/contact.html",
    "/google.html",
    "/women.html",
    "/login.html",
    "/blog/",
    "/blog/index.html",
    "/offline.html",
    "/offline",
    "/css/styles.css",
    "/js/site.js",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-512.png",
    "/icons/apple-touch-icon.png",
];

async function cacheUrl(cache, url) {
    try {
        const response = await fetch(url, { redirect: "follow" });
        if (!response.ok) return;
        const body = await response.blob();
        await cache.put(url, new Response(body, {
            status: 200,
            statusText: "OK",
            headers: response.headers,
        }));
    } catch {
        /* A missing file should not block installation. */
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => Promise.all(PRECACHE.map((url) => cacheUrl(cache, url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function offlinePage() {
    return (await caches.match("/offline.html")) || (await caches.match("/offline"));
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;
    if (new URL(request.url).origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok && !response.redirected) {
                        const copy = response.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => (await caches.match(request)) || offlinePage())
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const fetched = fetch(request)
                .then((response) => {
                    if (response && response.ok && !response.redirected) {
                        const copy = response.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || fetched;
        })
    );
});
