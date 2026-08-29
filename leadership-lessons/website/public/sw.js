const CACHE_NAME = "how-god-develops-leaders-v7";
const scope = self.registration.scope;
const coreAssets = [
  new URL("./", scope).toString(),
  new URL("./data/course.json", scope).toString(),
  new URL("./favicon.png", scope).toString(),
  new URL("./assets/01-six-phase-lifetime.svg", scope).toString(),
  new URL("./assets/02-course-coverage-map.svg", scope).toString(),
  new URL("./assets/03-formation-pathway.svg", scope).toString(),
  new URL("./assets/04-testing-expansion-cycle.svg", scope).toString(),
  new URL("./assets/05-ministry-task-continuum.svg", scope).toString(),
  new URL("./assets/06-giftedness-development.svg", scope).toString(),
  new URL("./assets/07-backlash-cycle.svg", scope).toString(),
  new URL("./assets/08-being-doing-spiral.svg", scope).toString(),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(coreAssets)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || url.pathname.endsWith("/data/course.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(new URL("./", scope))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
