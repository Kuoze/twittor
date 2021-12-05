// Imports
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v2';
const IMMUTABLE_CACHE = 'immutable-v1';

// Todo lo necesario para la app
const APP_SHELL = [
    //'/', // Para Producción no es necesario
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_IMMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

/* Instalación del Service Worker */
self.addEventListener('install', e => {
    // Guardar la cache
    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => cache.addAll( APP_SHELL ) );

    const cacheImmutable = caches.open( IMMUTABLE_CACHE ).then(cache => cache.addAll( APP_SHELL_IMMUTABLE ) );

    e.waitUntil( Promise.all([ cacheStatic, cacheImmutable]) );
});

/* Borrar los caches anteriores */
self.addEventListener('activate', e => {
    const res = caches.keys().then( keys => {
        keys.forEach( key => {
            if( key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if( key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }
        });        
    });

    e.waitUntil( res );
});

// Estrategia de Cache con dynamic fallback
self.addEventListener('fetch', e => {

    const respuesta = caches.match( e.request ).then(res => {
        if(res) {
            return res;
        } else {      
            return fetch( e.request ).then(newRes => {
                return actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });             
        }
    });

    e.respondWith( respuesta );
});