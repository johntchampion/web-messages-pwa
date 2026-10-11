import { useEffect } from 'react'

type OpenUrlMessage = { type: 'open-url'; url: string }

const isOpenUrlMessage = (data: unknown): data is OpenUrlMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as OpenUrlMessage).type === 'open-url' &&
  typeof (data as OpenUrlMessage).url === 'string'

/**
 * Navigates within the app when the service worker asks, such as after a
 * notification is tapped while the app is already open.
 */
export default function useServiceWorkerNavigation(
  navigate: (url: string) => void,
) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const onMessage = (event: MessageEvent) => {
      if (isOpenUrlMessage(event.data)) navigate(event.data.url)
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    navigator.serviceWorker.startMessages()
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [navigate])
}
