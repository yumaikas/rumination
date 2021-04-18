let CACHE_NAME = "rumination-bible-cache-v2";

var asset_urls = [
    "/",
    "/toc",
    "/js/bundle.js",
    "/css/app.css",
    "/img/icon3x.png",
    "/img/icon8x.png",
    "/manifest.json"
];


self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(asset_urls.map(url => new Request(url, {credentials: 'same-origin'})));
        }));

});

self.addEventListener("fetch", function(event) {
    // Might want to revisit this for POSTs
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
        .then(function (response) {
            event.waitUntil(updateCache(event.request, response.clone()));
            return response;
        })
        .catch(function (error) {
            return fromCache(event.request);
        }));
});

function fromCache(request) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status === 404) {
                return Promise.reject("no-match");
            }
            return matching;
        })
    });
}

function updateCache(request, response) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.put(request, response);
    });
}


