import { useEffect } from 'react'

import socket from '../util/socket'

/**
 * Tells the server while this conversation is visible and focused on this
 * device, so the device isn't sent push notifications for it.
 * Re-reports after reconnecting, since the server forgets on disconnect.
 */
export default function useReportViewingConversation(
  convoId: string | undefined,
  pushSubscriptionId: string | null,
  isSocketConnected: boolean,
) {
  useEffect(() => {
    if (!convoId || !pushSubscriptionId || !isSocketConnected) return

    const reportViewingState = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        socket.emit('viewing-conversation', { convoId, pushSubscriptionId })
      } else {
        socket.emit('stopped-viewing-conversation')
      }
    }

    reportViewingState()
    document.addEventListener('visibilitychange', reportViewingState)
    window.addEventListener('focus', reportViewingState)
    window.addEventListener('blur', reportViewingState)

    return () => {
      document.removeEventListener('visibilitychange', reportViewingState)
      window.removeEventListener('focus', reportViewingState)
      window.removeEventListener('blur', reportViewingState)
      socket.emit('stopped-viewing-conversation')
    }
  }, [convoId, pushSubscriptionId, isSocketConnected])
}
