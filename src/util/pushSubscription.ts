import restAPI from './rest'

const SUBSCRIPTION_ID_KEY = 'pushSubscriptionId'
const SUBSCRIPTION_ENDPOINT_KEY = 'pushSubscriptionEndpoint'

type SavedSubscriptionResponse = { subscriptionId: string }

export const isPushSupported = (): boolean =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

/** iOS only offers push to web apps added to the Home Screen. */
export const isPushAvailableAfterInstall = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.matchMedia('(display-mode: standalone)').matches

export const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return

  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.error('Failed to register service worker:', error)
  }
}

let vapidPublicKeyRequest: Promise<string | null> | null = null

/** Resolves to null when the server has push notifications turned off. */
export const fetchVapidPublicKey = (): Promise<string | null> => {
  vapidPublicKeyRequest ??= restAPI
    .get<{ publicKey: string }>('/push/public-key')
    .then((response) => response.data.publicKey || null)
    .catch(() => {
      vapidPublicKeyRequest = null
      return null
    })
  return vapidPublicKeyRequest
}

export const getStoredSubscriptionId = (): string | null =>
  localStorage.getItem(SUBSCRIPTION_ID_KEY)

export const getStoredSubscriptionEndpoint = (): string | null =>
  localStorage.getItem(SUBSCRIPTION_ENDPOINT_KEY)

/**
 * Asks for notification permission if needed, then subscribes this device.
 * Must run from a user gesture. Resolves to null if permission is declined.
 */
export const subscribeDevice = async (): Promise<string | null> => {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const subscription =
    (await findBrowserSubscription()) ?? (await createBrowserSubscription())
  return subscription ? saveSubscription(subscription) : null
}

/**
 * Re-saves this device's subscription so the server links it to whoever is
 * logged in, and replaces it if the browser rotated or dropped it.
 */
export const syncDeviceSubscription = async (): Promise<void> => {
  if (!isPushSupported() || !getStoredSubscriptionId()) return

  if (Notification.permission !== 'granted') {
    forgetStoredSubscription()
    return
  }

  try {
    const subscription =
      (await findBrowserSubscription()) ?? (await createBrowserSubscription())
    if (subscription) await saveSubscription(subscription)
  } catch (error) {
    console.error('Failed to sync push subscription:', error)
  }
}

const findBrowserSubscription = async () => {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

const createBrowserSubscription = async () => {
  const publicKey = await fetchVapidPublicKey()
  if (!publicKey) return null

  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeBase64Url(publicKey),
  })
}

const saveSubscription = async (
  subscription: PushSubscription,
): Promise<string> => {
  const response = await restAPI.post<SavedSubscriptionResponse>(
    '/push/subscriptions',
    {
      subscription: subscription.toJSON(),
      previousEndpoint: getStoredSubscriptionEndpoint(),
    },
  )
  localStorage.setItem(SUBSCRIPTION_ID_KEY, response.data.subscriptionId)
  localStorage.setItem(SUBSCRIPTION_ENDPOINT_KEY, subscription.endpoint)
  return response.data.subscriptionId
}

const forgetStoredSubscription = () => {
  localStorage.removeItem(SUBSCRIPTION_ID_KEY)
  localStorage.removeItem(SUBSCRIPTION_ENDPOINT_KEY)
}

const decodeBase64Url = (base64Url: string): Uint8Array<ArrayBuffer> => {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
