import { useCallback, useEffect, useState } from 'react'

import {
  fetchConversationNotificationsEnabled,
  setConversationNotificationsEnabled,
} from '../util/conversationNotifications'
import {
  fetchVapidPublicKey,
  getStoredSubscriptionEndpoint,
  getStoredSubscriptionId,
  isPushAvailableAfterInstall,
  isPushSupported,
  subscribeDevice,
} from '../util/pushSubscription'

export type ConversationNotificationStatus =
  | 'unavailable'
  | 'requires-install'
  | 'off'
  | 'on'

const INSTALL_INSTRUCTIONS =
  'To get notifications on this device, tap Share, then "Add to Home Screen", and open the app from your Home Screen.'
const PERMISSION_BLOCKED_INSTRUCTIONS =
  'Notifications are blocked for this site. Allow them in your browser settings, then try again.'

/**
 * Whether this device gets push notifications for a conversation, and a
 * toggle that subscribes the device the first time it's turned on.
 * `userId` refreshes the status when the logged-in user changes.
 */
export default function useConversationNotifications(
  convoId: string | undefined,
  userId: string | undefined,
) {
  const [isServerPushEnabled, setIsServerPushEnabled] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState(getStoredSubscriptionId)

  useEffect(() => {
    let isCurrent = true
    fetchVapidPublicKey().then((publicKey) => {
      if (isCurrent) setIsServerPushEnabled(publicKey !== null)
    })
    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    const endpoint = getStoredSubscriptionEndpoint()
    if (!convoId || !endpoint || !isServerPushEnabled || !isPushSupported()) {
      setIsEnabled(false)
      return
    }

    let isCurrent = true
    fetchConversationNotificationsEnabled(convoId, endpoint)
      .catch(() => false)
      .then((enabled) => {
        if (isCurrent) setIsEnabled(enabled)
      })
    return () => {
      isCurrent = false
    }
  }, [convoId, userId, subscriptionId, isServerPushEnabled])

  const toggle = useCallback(async () => {
    if (!convoId) return

    if (isPushAvailableAfterInstall()) {
      window.alert(INSTALL_INSTRUCTIONS)
      return
    }

    try {
      if (isEnabled) {
        await setConversationNotificationsEnabled(
          convoId,
          getStoredSubscriptionEndpoint()!,
          false,
        )
        setIsEnabled(false)
        return
      }

      const newSubscriptionId = await subscribeDevice()
      if (!newSubscriptionId) {
        if (Notification.permission === 'denied') {
          window.alert(PERMISSION_BLOCKED_INSTRUCTIONS)
        }
        return
      }

      await setConversationNotificationsEnabled(
        convoId,
        getStoredSubscriptionEndpoint()!,
        true,
      )
      setIsEnabled(true)
      setSubscriptionId(newSubscriptionId)
    } catch (error) {
      console.error('Failed to change notification settings:', error)
    }
  }, [convoId, isEnabled])

  return {
    status: determineStatus(isServerPushEnabled, isEnabled),
    subscriptionId,
    toggle,
  }
}

const determineStatus = (
  isServerPushEnabled: boolean,
  isEnabled: boolean,
): ConversationNotificationStatus => {
  if (!isServerPushEnabled) return 'unavailable'
  if (isPushAvailableAfterInstall()) return 'requires-install'
  if (!isPushSupported()) return 'unavailable'
  return isEnabled ? 'on' : 'off'
}
