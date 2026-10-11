// Service Worker for Web Push Notifications

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    return
  }

  event.waitUntil(showUnlessAlreadyViewing(data))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  event.waitUntil(openInAppWindow(url))
})

const findAppWindows = () =>
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })

const showUnlessAlreadyViewing = async (data) => {
  // The server skips devices it knows are viewing the conversation; this
  // catches pushes that were already in flight when the user opened it.
  const appWindows = await findAppWindows()
  const isViewingConversation = appWindows.some(
    (client) =>
      client.focused &&
      client.visibilityState === 'visible' &&
      new URL(client.url).pathname === data.url,
  )
  if (isViewingConversation) return

  await self.registration.showNotification(data.title || 'New Message', {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: data.tag,
    renotify: Boolean(data.tag),
    data: { convoId: data.convoId, url: data.url || '/' },
  })
}

const openInAppWindow = async (url) => {
  const appWindows = await findAppWindows()
  const appWindow =
    appWindows.find((client) => client.focused) ||
    appWindows.find((client) => client.visibilityState === 'visible') ||
    appWindows[0]

  if (!appWindow) {
    await self.clients.openWindow(url)
    return
  }

  await appWindow.focus()
  // The app navigates itself, so an open conversation switches without reloading.
  appWindow.postMessage({ type: 'open-url', url })
}
