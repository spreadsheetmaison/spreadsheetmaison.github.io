// Offline cache for the hosted Gamified ADHD Task Planner; the planner's data stays on the device (localStorage).
// The page is fetched network-first so updates reach installed copies; the cache is the offline fallback.
const CACHE = "adhd-task-planner-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
const store = (req, res) => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; };
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(res => store(e.request, res)).catch(() => caches.match(e.request, {ignoreSearch: true}).then(hit => hit || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => store(e.request, res)).catch(() => caches.match("index.html"))));
});
