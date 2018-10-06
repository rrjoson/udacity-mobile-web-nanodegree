importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js"
);

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
  new RegExp(".*.js"),
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  new RegExp(".*.html?.+"),
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  /.*\.css/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: "review-app-css-cache"
  })
);

workbox.routing.registerRoute(
  /.*\.jpg/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: "review-app-image-cache"
  })
);

workbox.precaching.precacheAndRoute([
  { url: "/index.html" },
  { url: "/restaurant.html" }
]);
