if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function(reg) {
      console.log("registered");
    })
    .catch(function() {
      console.log("failed");
    });

  navigator.serviceWorker.ready.then(function(registeration) {
    console.log("Service Worker Ready");
  });
}
