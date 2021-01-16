const CACHE_STATIC_NAME = 'static';
const URLS_TO_PRECACHE = [
    '/',
    'index.html',
    'src/js/app.js',
    'src/js/feed.js',
    'src/js/utility.js',
    'src/lib/material.min.js',
    'src/lib/idb.js',
    'src/css/app.css',
    'src/css/feed.css',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'src/images/main-image.jpg',
    'src/images/main-image-lg.jpg',
    'src/images/main-image-sm.jpg',
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            console.log('[Service Worker] Precaching App Shell');
            cache.addAll(URLS_TO_PRECACHE);
        })
        .then(() => {
            console.log('[ServiceWorker] Skip waiting on install');
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching something ....', event);
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                console.log(response);
                return response;
            }
            return fetch(event.request);
        })
    );
});

self.addEventListener('sync', event => {
 console.log('[Service Worker] Background syncing', event);
 if (event.tag === 'sync-new-selfies') {
     console.log('[Service Worker] Syncing new Posts');
     event.waitUntil(
         readAllData('sync-selfies')
         .then(syncSelfies => {
             for (const syncSelfie of syncSelfies) {
                 const postData = new FormData();
                 postData.append('id', syncSelfie.id);
                 postData.append('title', syncSelfie.title);
                 postData.append('location', syncSelfie.location);
                 postData.append('selfie', syncSelfie.selfie);
                 fetch(API_URL, {method: 'POST', body: postData})
                 .then(response => {
                     console.log('Sent data', response);
                     if (response.ok) {
                         response.json()
                         .then(resData => {
                             deleteItemFromData('sync-selfies',
                             parseInt(resData.id));
                         });
                     }
                 })
                 .catch(error => 
                      console.log('Error while sending data', error));
             }
         })
     );
 }
});
