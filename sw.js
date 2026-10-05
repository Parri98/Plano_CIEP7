const CACHE='ciep7-map-v1.3.0';
const APP_SHELL=[
  './','./index.html','./styles.css','./app.js','./config.js','./data/programa.js',
  './manifest.webmanifest','./assets/logo-ciep7.png','./assets/icon-192.png','./assets/icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  // Ortofotos/mapas siempre desde red: evita llenar el móvil con cientos de teselas obsoletas.
  if(url.hostname.includes('ign.es') || url.hostname.includes('openstreetmap.org')) return;
  if(url.origin===location.origin){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;})));
  }
});
