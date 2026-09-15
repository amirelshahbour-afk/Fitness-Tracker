self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.delete('fitness-tracker-v1').then(()=>self.registration.unregister())));
