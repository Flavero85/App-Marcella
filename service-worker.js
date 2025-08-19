// Versão do cache aumentada para forçar a atualização de todos os arquivos
const CACHE_NAME = 'app-to-marcella-vFinalPWA'; 

// Lista de todos os arquivos que o aplicativo precisa para funcionar offline
const URLS_TO_CACHE = [
  './',
  './index.html',
  './add-patient.html',
  './patient-details.html',
  './notes.html',
  './schedule.html',
  './script.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Evento de Instalação: Salva todos os arquivos listados no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto. Adicionando arquivos para funcionamento offline.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de Fetch: Intercepta as requisições. Se estiver offline, responde com os arquivos do cache.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o arquivo for encontrado no cache, retorna ele. Senão, busca na rede.
        return response || fetch(event.request);
      })
  );
});

// Evento de Ativação: Limpa caches antigos se a versão do CACHE_NAME mudar.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
