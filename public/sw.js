const CACHE = 'nexus-shell-v2';
const DB_NAME = 'nexus_background';
const STORE = 'reminders';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/','/manifest.webmanifest'])));
  self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function checkReminders() {
  try {
    const db = await openDb();
    const reminders = await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error);
    });
    const now = Date.now();
    for (const reminder of reminders) {
      if (!reminder.firedAt && new Date(reminder.dueAt).getTime() <= now) {
        await self.registration.showNotification('Nexus reminder', { body: reminder.title, tag: reminder.id });
        reminder.firedAt = new Date().toISOString();
        const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(reminder);
      }
    }
  } catch {}
}
self.addEventListener('message', event => { if (event.data?.type === 'CHECK_REMINDERS') event.waitUntil(checkReminders()); });
self.addEventListener('periodicsync', event => { if (event.tag === 'nexus-reminders') event.waitUntil(checkReminders()); });
self.addEventListener('fetch', event => { if (event.request.method !== 'GET') return; event.respondWith(fetch(event.request).catch(() => caches.match(event.request))); });