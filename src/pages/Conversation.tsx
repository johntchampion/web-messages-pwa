import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { MessageType, PageInfo } from '../types'
import getDaysRemaining from '../util/daysRemaining'
import socket from '../util/socket'
import UserContext from '../util/userContext'
import ICON_MAP from '../util/profileIcons'
import MessageView from '../components/MessageView'
import NavBar from '../components/NavBar'
import ComposeBox from '../components/ComposeBox'
import EditProfile from '../components/EditProfile'
import SetupProfileButton from '../components/SetupProfileButton'
import EditConversationDialog from '../components/EditConversationDialog'
import useViewportHeight from '../hooks/useViewportHeight'
import type { RootState } from '../store/store'
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  IconContainer,
  LinkDisplayContainer,
  gradientTextStyle,
} from '../components/shared/StyledComponents'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Web Messages'

const ConversationLayout = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  min-height: 0;
`

const ScrollContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`

const MessageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const ErrorViewContainer = styled.div`
  margin: 6rem auto 0 auto;
  text-align: center;
  max-width: 28rem;
  padding: 0 1rem;
`

const ErrorCard = styled(Card)`
  padding: 3rem 2rem;
`

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
`

const ErrorViewTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  ${gradientTextStyle}
`

const ErrorViewMessage = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: #666;
  line-height: 1.5;
  margin-bottom: 2rem;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const ErrorViewButton = styled(PrimaryButton)`
  max-width: 12rem;
  margin: 0 auto;
`

const ShareChatContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 1rem 2rem;

  @media (min-width: 30rem) {
    padding: 2rem;
  }
`

const ShareChatCard = styled(Card)`
  max-width: 32rem;
  width: 100%;
  text-align: center;
  padding: 1.25rem 1rem;

  @media (min-width: 30rem) {
    padding: 2.5rem 2rem;
  }
`

const ShareIcon = styled(IconContainer)`
  width: 40px;
  height: 40px;
  margin: 0 auto 0.75rem;
  font-size: 1.25rem;
  border-radius: 12px;

  @media (min-width: 30rem) {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
    border-radius: 16px;
  }
`

const ShareChatTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.375rem 0;
  color: #222;

  @media (min-width: 30rem) {
    font-size: 1.5rem;
    margin: 0 0 0.75rem 0;
  }

  @media (prefers-color-scheme: dark) {
    color: #e5e5e5;
  }
`

const ShareChatLabel = styled.p`
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #666;
  margin: 0 0 1rem 0;

  @media (min-width: 30rem) {
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const StyledLinkDisplay = styled(LinkDisplayContainer)`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  font-size: 0.8rem;

  @media (min-width: 30rem) {
    margin-bottom: 1.25rem;
    padding: 1rem;
    font-size: 0.9rem;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 30rem) {
    flex-direction: row;
    gap: 0.75rem;
  }
`

const StyledPrimaryButton = styled(PrimaryButton)`
  flex: 1;
`

const StyledSecondaryButton = styled(SecondaryButton)`
  flex: 1;
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-color-scheme: dark) {
    border-color: rgba(255, 255, 255, 0.1);
    border-top-color: #667eea;
  }
`

const LoadingText = styled.div`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const sendNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options)
  }
}

function ErrorView({
  title,
  message,
  onBackClick,
}: {
  title: string
  message: string
  onBackClick: () => void
}) {
  return (
    <ErrorViewContainer>
      <ErrorCard>
        <ErrorIcon>🔍</ErrorIcon>
        <ErrorViewTitle>{title}</ErrorViewTitle>
        <ErrorViewMessage>{message}</ErrorViewMessage>
        <ErrorViewButton onClick={onBackClick}>Go to Home</ErrorViewButton>
      </ErrorCard>
    </ErrorViewContainer>
  )
}

function ShareChat() {
  const [copySuccess, setCopySuccess] = useState(false)
  const shareUrl = window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl })
      } catch (err) {
        console.error('Failed to share:', err)
      }
    }
  }

  const canShare = navigator.share !== undefined

  return (
    <ShareChatContainer>
      <ShareChatCard>
        <ShareIcon>🔗</ShareIcon>
        <ShareChatTitle>Start the Conversation</ShareChatTitle>
        <ShareChatLabel>
          Share this link with anyone you want to include in the chat.
        </ShareChatLabel>
        <StyledLinkDisplay>{shareUrl}</StyledLinkDisplay>
        <ButtonGroup>
          <StyledPrimaryButton onClick={handleCopy}>
            {copySuccess ? '✓ Copied!' : 'Copy Link'}
          </StyledPrimaryButton>
          {canShare && (
            <StyledSecondaryButton onClick={handleShare}>
              Share
            </StyledSecondaryButton>
          )}
        </ButtonGroup>
      </ShareChatCard>
    </ShareChatContainer>
  )
}

function LoadingIndicator() {
  return (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingText>Loading messages...</LoadingText>
    </LoadingContainer>
  )
}

export default function ConversationView() {
  const navigate = useNavigate()
  const { convoId } = useParams()
  const { user: authUser, accessToken } = useSelector(
    (state: RootState) => state.auth,
  )
  const [user, setUser] = useContext(UserContext)
  const [shouldEditUser, setShouldEditUser] = useState(false)

  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)
  const [convoName, setConvoName] = useState('')
  const [convoCreatorId, setConvoCreatorId] = useState<string | null>(null)
  const [deletionDate, setDeletionDate] = useState<Date>()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
  const [doesChatExist, setDoesChatExist] = useState<boolean>()
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false)
  const [showNotificationButton, setShowNotificationButton] = useState(
    'Notification' in window && Notification.permission === 'default',
  )
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [typingUsers, setTypingUsers] = useState<
    Map<string, { timeout: NodeJS.Timeout; timestamp: number }>
  >(new Map())
  const lastTypingEmit = useRef<number>(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { height: viewportHeight, offsetTop: viewportOffsetTop } =
    useViewportHeight()
  const prevViewportHeight = useRef(viewportHeight)
  const fullViewportHeight = useRef(window.innerHeight)
  const isKeyboardVisible = viewportHeight < fullViewportHeight.current - 100

  const daysRemaining = deletionDate
    ? getDaysRemaining(new Date(), deletionDate)
    : undefined

  // Clear typing state and timeouts when switching conversations
  useEffect(() => {
    setTypingUsers((prev) => {
      prev.forEach(({ timeout }) => clearTimeout(timeout))
      return new Map()
    })
    lastTypingEmit.current = 0
  }, [convoId])

  // Lock body scroll to prevent iOS from shifting the viewport when keyboard opens
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.overflow = 'hidden'
    body.style.height = '100%'
    body.style.position = 'fixed'
    body.style.width = '100%'

    return () => {
      html.style.overflow = ''
      html.style.height = ''
      body.style.overflow = ''
      body.style.height = ''
      body.style.position = ''
      body.style.width = ''
    }
  }, [])

  const handleNotificationToggle = () => {
    if (!('Notification' in window)) return

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will receive notifications for new messages!',
        })
      }
      // Hide button after user makes a decision (granted or denied)
      setShowNotificationButton(false)
    })
  }

  const handleTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingEmit.current < 2000) return
    lastTypingEmit.current = now

    const userName = authUser?.displayName || user.name
    if (convoId && userName) {
      socket.emit('typing', { convoId, userName })
    }
  }, [convoId, authUser?.displayName, user.name])

  const typingIndicatorText = useMemo(() => {
    const names = Array.from(typingUsers.keys())
    if (names.length === 0) return ''
    if (names.length === 1) return `${names[0]} is typing...`
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
    return `${names.slice(0, 2).join(', ')} and ${names.length - 2} other${names.length - 2 > 1 ? 's' : ''} are typing...`
  }, [typingUsers])

  // Handle WebSocket events.
  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true)
    const onDisconnect = () => setIsSocketConnected(false)
    const onMessageCreated = (payload: any) => {
      const newMessageConvoId = payload.convoId
      if (newMessageConvoId !== convoId) return // Ignore messages for other conversations

      const newMessage = payload.message
      const messageSenderId =
        newMessage['senderId'] ||
        `${newMessage['senderName']}-${newMessage['senderAvatar']}`
      const currentUserId = authUser?.id || `${user.name}-${user.avatar}`

      // Show notification if message is from another user and page is in background or not focused
      const shouldNotify =
        messageSenderId !== currentUserId &&
        (!document.hasFocus() || document.hidden)

      if (shouldNotify) {
        const avatarIcon = newMessage['senderAvatar']
          ? ICON_MAP[newMessage['senderAvatar']] || newMessage['senderAvatar']
          : undefined

        sendNotification(`${newMessage['senderName']} in ${convoName}`, {
          body: newMessage['content'],
          icon: avatarIcon,
        })
      }

      // Clear typing indicator for the sender since their message arrived
      const senderName = newMessage['senderName']
      if (senderName) {
        setTypingUsers((prev) => {
          const existing = prev.get(senderName)
          if (!existing) return prev
          clearTimeout(existing.timeout)
          const next = new Map(prev)
          next.delete(senderName)
          return next
        })
      }

      setMessages((msgs) => {
        const messagesCopy = msgs.map((m) => ({ ...m }))
        messagesCopy.push({
          id: newMessage['id'],
          userId: messageSenderId,
          timestamp: new Date(newMessage['createdAt']),
          content: newMessage['content'],
          type: newMessage['type'],
          userProfilePic: newMessage['senderAvatar'],
          userFullName: newMessage['senderName'],
          delivered: 'delivered',
        })
        return messagesCopy
      })
    }
    const onConversationUpdated = (payload: any) => {
      setConvoName(payload.conversation['name'])
      setConvoCreatorId(payload.conversation['creatorId'] || null)
      setDeletionDate(new Date(payload.deletionDate))
    }
    const onUserUpdated = (payload: any) => {
      const updatedConvoId = payload.convoId
      if (updatedConvoId !== convoId) return // Ignore updates for other conversations

      const { userId, displayName, profilePicURL } = payload
      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          // Update messages from this user
          if (msg.userId === userId) {
            return {
              ...msg,
              userProfilePic: profilePicURL,
              userFullName: displayName,
            }
          }
          return msg
        })
      })
    }
    const onConversationDeleted = (payload: any) => {
      const deletedConvoId = payload.convoId
      if (deletedConvoId !== convoId) return // Ignore deletions for other conversations

      // Clear conversation state
      setMessages([])
      setConvoName('')
      setDeletionDate(undefined)
      setDoesChatExist(false)
    }
    const onUserTyping = (payload: any) => {
      if (payload.convoId !== convoId) return
      const { userName } = payload

      setTypingUsers((prev) => {
        const next = new Map(prev)
        // Clear existing timeout for this user
        const existing = next.get(userName)
        if (existing) clearTimeout(existing.timeout)

        // Capture timestamp for this typing event
        const timestamp = Date.now()

        // Set a new 5-second auto-clear timeout
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const current = prev.get(userName)
            // Only remove if this timeout hasn't been superseded by a newer event
            if (current && current.timestamp === timestamp) {
              const updated = new Map(prev)
              updated.delete(userName)
              return updated
            }
            return prev
          })
        }, 3000)

        next.set(userName, { timeout, timestamp })
        return next
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('message-created', onMessageCreated)
    socket.on('conversation-updated', onConversationUpdated)
    socket.on('user-updated', onUserUpdated)
    socket.on('conversation-deleted', onConversationDeleted)
    socket.on('user-typing', onUserTyping)

    // Check current state after setting up listeners to avoid race condition
    if (socket.connected) {
      setIsSocketConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('message-created', onMessageCreated)
      socket.off('conversation-updated', onConversationUpdated)
      socket.off('user-updated', onUserUpdated)
      socket.off('conversation-deleted', onConversationDeleted)
      socket.off('user-typing', onUserTyping)
    }
  }, [convoId, authUser, user, convoName])

  // Scroll to bottom of message area when new messages arrive.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Scroll to bottom when keyboard opens (viewport shrinks) to keep latest messages visible.
  useEffect(() => {
    if (viewportHeight < prevViewportHeight.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
    prevViewportHeight.current = viewportHeight
  }, [viewportHeight])

  // Update messages when logged-in user's profile changes
  useEffect(() => {
    if (!authUser) return

    setMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        // Only update messages from the logged-in user
        if (msg.userId === authUser.id) {
          return {
            ...msg,
            userProfilePic: authUser.profilePicURL,
            userFullName: authUser.displayName,
          }
        }
        return msg
      })
    })
  }, [authUser?.profilePicURL, authUser?.displayName])

  // Update page title when conversation name changes
  useEffect(() => {
    if (convoName) {
      document.title = `${convoName} - ${APP_NAME}`
    } else {
      document.title = APP_NAME
    }

    // Reset title when component unmounts
    return () => {
      document.title = APP_NAME
    }
  }, [convoName])

  // Show loading indicator only if loading takes more than 500ms
  useEffect(() => {
    if (!isLoadingMessages) {
      setShowLoadingIndicator(false)
      return
    }

    const timer = setTimeout(() => {
      setShowLoadingIndicator(true)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [isLoadingMessages])

  // Join conversation and fetch messages when connected.
  useEffect(() => {
    if (!isSocketConnected || !convoId) return

    setIsLoadingMessages(true)
    setPageInfo(null)

    // Join the conversation room to receive real-time updates
    socket.emit('join-conversation', { convoId }, (response: any) => {
      if (!response.success) {
        /*
          IMPORTANT:
          A response will still succeed even if the conversation does not exist.
          The 'list-messages' call below will return an error in that case.
          Joining a room only means you want to listen for updates to that room,
          it does not validate the room's existence.
        */
        setIsLoadingMessages(false)
        console.error('Failed to join conversation:', response.error)
        return
      }

      // Fetch messages for this conversation
      socket.emit(
        'list-messages',
        { convoId, token: '', limit: 50 },
        (response: any) => {
          if (!response.success) {
            if (response.error?.includes('no conversation')) {
              setDoesChatExist(false)
            }
            setIsLoadingMessages(false)
            console.error('Failed to fetch messages:', response.error)
            return
          }

          const parsedMessages: MessageType[] = response.data.messages.map(
            (msg: any) => ({
              id: msg['id'],
              userId:
                msg['senderId'] ||
                `${msg['senderName']}-${msg['senderAvatar']}`,
              timestamp: new Date(msg['createdAt']),
              content: msg['content'],
              type: msg['type'],
              userProfilePic: msg['senderAvatar'],
              userFullName: msg['senderName'],
              delivered: 'delivered',
            }),
          )
          setIsLoadingMessages(false)
          setMessages(parsedMessages)
          setConvoName(response.data.conversation['name'])
          setConvoCreatorId(response.data.conversation['creatorId'] || null)
          setDeletionDate(new Date(response.data.deletionDate))
          setDoesChatExist(true)
          if (response.data.pageInfo) {
            setPageInfo(response.data.pageInfo)
          }
        },
      )
    })

    // Cleanup: Leave the conversation room when component unmounts or convoId changes
    return () => {
      socket.emit('leave-conversation', { convoId })
    }
  }, [isSocketConnected, convoId])

  // Record this conversation as recently visited for logged-in users.
  // This is a separate effect because on direct page loads (e.g. clicking a shared link),
  // the access token is not yet available when the list-messages effect above fires —
  // initializeAuth completes after the socket connects. Since list-messages succeeds
  // without auth, the socket middleware's retry mechanism can't help. This effect waits
  // for both the token and confirmed conversation existence before recording the visit.
  useEffect(() => {
    if (!isSocketConnected || !convoId || !accessToken || !doesChatExist) return
    socket.emit('get-conversation', { convoId, token: '' }, () => {})
  }, [isSocketConnected, convoId, accessToken, doesChatExist])

  const sendMessageHandler = (messageContent: string) => {
    if (!messageContent || !convoId) return

    const senderName = authUser?.displayName || user.name
    const senderAvatar = authUser?.profilePicURL || user.avatar

    // Send message to server - it will be added to UI via 'message-created' broadcast
    socket.emit(
      'create-message',
      {
        convoId: convoId,
        content: messageContent,
        userName: senderName,
        userAvatar: senderAvatar,
        token: accessToken, // Server should automatically use logged-in user if token is provided
      },
      (response: any) => {
        if (!response.success) {
          console.error('Failed to send message:', response.error)
          // TODO: Show error to user
          return
        }
        // Message successfully sent and will appear via 'message-created' event
      },
    )
  }

  const handleLoadOlderMessages = () => {
    if (!convoId || !pageInfo?.hasMore || isLoadingOlderMessages) return

    setIsLoadingOlderMessages(true)

    socket.emit(
      'list-messages',
      { convoId, token: '', limit: 50, before: pageInfo.startCursor },
      (response: any) => {
        setIsLoadingOlderMessages(false)

        if (!response.success) {
          console.error('Failed to load older messages:', response.error)
          return
        }

        const olderMessages: MessageType[] = response.data.messages.map(
          (msg: any) => ({
            id: msg['id'],
            userId:
              msg['senderId'] || `${msg['senderName']}-${msg['senderAvatar']}`,
            timestamp: new Date(msg['createdAt']),
            content: msg['content'],
            type: msg['type'],
            userProfilePic: msg['senderAvatar'],
            userFullName: msg['senderName'],
            delivered: 'delivered',
          }),
        )

        setMessages((prev) => [...olderMessages, ...prev])
        if (response.data.pageInfo) {
          setPageInfo(response.data.pageInfo)
        }
      },
    )
  }

  const handleRenameConversation = (newName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!convoId) {
        reject(new Error('Conversation ID is required.'))
        return
      }

      socket.emit(
        'update-conversation',
        {
          convoId,
          name: newName,
          token: accessToken,
        },
        (response: any) => {
          if (!response.success) {
            reject(
              new Error(response.error || 'Failed to rename conversation.'),
            )
            return
          }

          // Update local state with the new conversation data
          setConvoName(response.data.conversation['name'])
          setConvoCreatorId(response.data.conversation['creatorId'] || null)
          setDeletionDate(new Date(response.data.deletionDate))

          resolve()
        },
      )
    })
  }

  // Determine if the current user can rename the conversation
  const canRenameConversation = useMemo(() => {
    // If conversation doesn't exist yet, can't rename
    if (doesChatExist === false || doesChatExist === undefined) return false

    // If conversation has no creator (creatorId is null), anyone can rename
    if (convoCreatorId === null) return true

    // If conversation has a creator, only that creator can rename
    return authUser?.id === convoCreatorId
  }, [doesChatExist, convoCreatorId, authUser?.id])

  // If chat doesn't exist, show only the error view
  if (doesChatExist === false) {
    return (
      <ErrorView
        title={"This is not the converation you're looking for."}
        message={'This chat has either expired or never existed.'}
        onBackClick={() => navigate('/')}
      />
    )
  }

  return (
    <ConversationLayout
      style={{ height: `${viewportHeight}px`, top: `${viewportOffsetTop}px` }}
    >
      {shouldEditUser && (
        <EditProfile
          user={user}
          onChangeUser={({ name, avatar }) => {
            setUser({ name, avatar })
            setShouldEditUser(false)
          }}
          onDismiss={() => setShouldEditUser(false)}
        />
      )}
      {showRenameDialog && (
        <EditConversationDialog
          currentName={convoName}
          onRename={handleRenameConversation}
          onDismiss={() => setShowRenameDialog(false)}
        />
      )}
        <ScrollableArea ref={scrollAreaRef}>
          <ScrollContent>
            <NavBar
              title={doesChatExist === undefined ? 'Loading...' : convoName}
              subtitle={
                doesChatExist
                  ? `${daysRemaining} ${
                      daysRemaining === 1 ? 'day' : 'days'
                    } remaining`
                  : undefined
              }
              onUserClick={() => setShouldEditUser(true)}
              userName={authUser?.displayName || user.name}
              userAvatar={authUser?.profilePicURL || user.avatar}
              isAnonymous={!authUser}
              onNotificationToggle={
                showNotificationButton ? handleNotificationToggle : undefined
              }
              onRenameClick={
                canRenameConversation
                  ? () => setShowRenameDialog(true)
                  : undefined
              }
            />
            <MessageContent>
              {showLoadingIndicator ? (
                <LoadingIndicator />
              ) : messages.length === 0 && !isLoadingMessages ? (
                <ShareChat />
              ) : (
                <MessageView
                  highlightId={authUser?.id || `${user.name}-${user.avatar}`}
                  isLoadingOlderMessages={isLoadingOlderMessages}
                  onLoadOlderMessages={handleLoadOlderMessages}
                  showLoadOlderMessagesButton={pageInfo?.hasMore ?? false}
                  messages={messages}
                  typingIndicator={typingIndicatorText}
                />
              )}
            </MessageContent>
            {!authUser && user.name.length === 0 ? (
              <SetupProfileButton onClick={() => setShouldEditUser(true)} />
            ) : (
              <ComposeBox
                becameActive={() => {}}
                disableUpload={true}
                onUploadFile={() => {}}
                sendMessage={sendMessageHandler}
                onTyping={handleTyping}
                keyboardVisible={isKeyboardVisible}
              />
            )}
          </ScrollContent>
        </ScrollableArea>
    </ConversationLayout>
  )
}
