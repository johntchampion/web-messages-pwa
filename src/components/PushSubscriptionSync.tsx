import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import type { RootState } from '../store/store'
import { syncDeviceSubscription } from '../util/pushSubscription'

/**
 * Keeps this device's push subscription linked to whoever is logged in:
 * linked after logging in, unlinked after logging out.
 */
export default function PushSubscriptionSync() {
  const { user, isInitializing } = useSelector(
    (state: RootState) => state.auth,
  )
  const userId = user?.id

  useEffect(() => {
    if (isInitializing) return
    syncDeviceSubscription()
  }, [userId, isInitializing])

  return null
}
