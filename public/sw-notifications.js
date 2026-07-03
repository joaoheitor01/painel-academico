/* eslint-disable no-undef */
// Handlers de notificação injetados no Service Worker do Workbox
// (via workbox.importScripts em vite.config.js). Este arquivo NÃO faz cache,
// install ou skipWaiting — isso é responsabilidade do SW gerado pelo
// vite-plugin-pwa. Aqui ficam só os listeners de notificação.

const APP_URL = "/painel-academico/";
const APP_ICON = "/painel-academico/icon-192.png";

// Recebe mensagens do app principal para exibir notificações.
self.addEventListener("message", (e) => {
  if (e.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, icon } = e.data;
    self.registration.showNotification(title, {
      body,
      tag, // evita duplicatas
      icon: icon || APP_ICON,
      badge: APP_ICON,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: APP_URL },
    });
  }
});

// Tap na notificação abre/foca o app.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      const existing = list.find((c) => c.url.includes("painel-academico"));
      if (existing) return existing.focus();
      return clients.openWindow(APP_URL);
    })
  );
});
