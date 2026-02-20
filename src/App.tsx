import { useEffect, useRef, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from './store/store'
import { initializeAuth } from './store/slices/auth'
import UserContext, { UserType } from './util/userContext'
import { registerServiceWorker, subscribeToPush } from './util/pushNotifications'
import ConversationView from './pages/Conversation'
import NewConversation from './pages/NewConversation'
import Landing from './pages/Landing'
import About from './pages/About'
import ResetPassword from './pages/ResetPassword'

const router = createBrowserRouter([
  {
    path: '/',
    element: <NewConversation />,
  },
  {
    path: '/login',
    element: <Landing />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/:convoId',
    element: <ConversationView />,
  },
])

function App() {
  const [user, setUser] = useState<UserType>({ name: '', avatar: '' })
  const didInitAuthRef = useRef(false)

  useEffect(() => {
    if (didInitAuthRef.current) {
      return
    }
    didInitAuthRef.current = true
    store.dispatch(initializeAuth())
  }, [])

  // Register service worker on mount and subscribe to push when user logs in
  useEffect(() => {
    registerServiceWorker()

    let wasAuthenticated = false
    const unsubscribe = store.subscribe(() => {
      const { accessToken } = store.getState().auth
      const isAuthenticated = !!accessToken

      if (isAuthenticated && !wasAuthenticated) {
        subscribeToPush()
      }
      wasAuthenticated = isAuthenticated
    })

    return unsubscribe
  }, [])

  // Retrieve user info for users without an account.
  useEffect(() => {
    const name = localStorage.getItem('name') || ''
    const avatar = localStorage.getItem('avatar') || ''
    setUser({ name, avatar })
  }, [])

  // Store user info for users without an account.
  useEffect(() => {
    if (user.name.length > 0 || user.avatar.length > 0) {
      localStorage.setItem('name', user.name)
      localStorage.setItem('avatar', user.avatar)
    }
  }, [user])

  return (
    <Provider store={store}>
      <UserContext.Provider value={[user, setUser]}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </Provider>
  )
}

export default App
