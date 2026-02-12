import styled from 'styled-components'

import { MessageType } from '../types'
import ICON_MAP from '../util/profileIcons'

const TextBubble = styled.div<{ $highlighted?: boolean; $delivered?: boolean }>`
  display: inline-block;
  background: ${(props) =>
    props.$highlighted
      ? `linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%)`
      : props.$delivered
      ? 'var(--content-background)'
      : 'gray'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 10px 14px;
  margin-top: 4px;
  font-size: 16px;
  overflow-wrap: break-word;
  hyphens: auto;
  color: ${(props) => (props.$highlighted ? 'white' : 'initial')};

  @media (prefers-color-scheme: dark) {
    background: ${(props) =>
      props.$highlighted
        ? `linear-gradient(135deg, #78729f 0%, #5a5479 100%)`
        : props.$delivered
        ? 'var(--content-background)'
        : 'gray'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    color: #dcd8d3;
  }
`

const ImageBubble = styled.div`
  margin-top: 4px;
  max-width: 25rem;
`

const Block = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin: 16px 8px;
`

const BlockSenderImage = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  height: 44px;
  width: 44px;
  border-radius: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: var(--content-background);

  & img {
    object-fit: contain;
    height: 32px;
    width: 32px;
  }

  @media (prefers-color-scheme: dark) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    & img {
      filter: brightness(0) invert(1) opacity(0.6);
    }
  }
`

const BlockSenderName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 2px;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const BlockTimestamp = styled.span`
  font-weight: 400;
  color: #999;
  margin-left: 6px;

  @media (prefers-color-scheme: dark) {
    color: #666;
  }
`

const DateSeparator = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  margin: 24px 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (prefers-color-scheme: dark) {
    color: #666;
  }
`

const View = styled.div<{ $margin?: string }>`
  width: 100%;
  margin: ${(props) => props.$margin || '82px auto 120px auto'};
  max-width: 40rem;

  @media (min-width: 40rem) {
    margin: ${(props) => props.$margin || '82px auto 124px auto'};
  }
`

const ViewLoadMessagesButtonContainer = styled.div`
  text-align: center;
  margin: 1rem 0;
`

const TypingIndicatorText = styled.div`
  font-size: 13px;
  font-style: italic;
  color: #999;
  padding: 4px 16px 8px 16px;

  @media (prefers-color-scheme: dark) {
    color: #777;
  }
`

type BubbleProps = {
  type: string
  highlighted: boolean
  delivered: string
  content: string
}

type BlockProps = {
  senderName: string
  senderIcon: string
  highlighted: boolean
  timestamp: Date
  messages: { content: string; type: string; delivered: string; id: string }[]
}

type ViewProps = {
  messages: MessageType[]
  highlightId: string
  showLoadOlderMessagesButton: boolean
  onLoadOlderMessages: () => void
  isLoadingOlderMessages: boolean
  margin?: string
  typingIndicator?: string
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const formatDateSeparator = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, today)) {
    return 'Today'
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }
}

const linkifyText = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

const MessageBubble = ({
  type, // 'text', 'image'
  highlighted,
  delivered, // 'delivered', 'delivering', 'not delivered'
  content,
}: BubbleProps) => {
  if (type === 'image') {
    return (
      <ImageBubble>
        <img src={content} alt='Message Attachment' />
      </ImageBubble>
    )
  } else {
    return (
      <div>
        <TextBubble
          $highlighted={highlighted}
          $delivered={delivered == 'delivered'}
        >
          {linkifyText(content)}
        </TextBubble>
      </div>
    )
  }
}

const MessageBlock = ({
  senderName,
  senderIcon,
  highlighted,
  timestamp,
  messages,
}: BlockProps) => {
  let messageBubbles = messages.map((message) => {
    return (
      <MessageBubble
        content={message.content}
        highlighted={highlighted}
        delivered={message.delivered}
        type={message.type}
        key={message.id}
      />
    )
  })

  return (
    <Block>
      <BlockSenderImage>
        <img src={ICON_MAP[senderIcon]} alt='Profile' />
      </BlockSenderImage>
      <div>
        <BlockSenderName>
          {senderName}
          <BlockTimestamp>{formatTime(timestamp)}</BlockTimestamp>
        </BlockSenderName>
        {messageBubbles}
      </div>
    </Block>
  )
}

const MessageView = ({
  highlightId,
  isLoadingOlderMessages,
  showLoadOlderMessagesButton,
  onLoadOlderMessages,
  margin,
  messages,
  typingIndicator,
}: ViewProps) => {
  const sortedMessages = messages
    .map((msg) => ({ ...msg }))
    .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf())

  // Consecutive messages sent from the same sender must be grouped together.
  const messageBlocks: {
    senderId: string
    senderImg: string
    senderName: string
    messages: MessageType[]
  }[] = []
  for (let i = 0; i < sortedMessages.length; i++) {
    const message = sortedMessages[i]

    if (
      messageBlocks.length > 0 &&
      messageBlocks[messageBlocks.length - 1].senderId === message.userId &&
      Math.abs(
        messageBlocks[messageBlocks.length - 1].messages[
          messageBlocks[messageBlocks.length - 1].messages.length - 1
        ].timestamp.valueOf() - message.timestamp.valueOf()
      ) < 60000
    ) {
      messageBlocks[messageBlocks.length - 1].messages.push({ ...message })
    } else {
      const newBlock = {
        senderId: message.userId,
        senderImg: message.userProfilePic,
        senderName: message.userFullName,
        messages: [{ ...message }],
      }
      messageBlocks.push(newBlock)
    }
  }

  return (
    <View $margin={margin}>
      {showLoadOlderMessagesButton ? (
        <ViewLoadMessagesButtonContainer>
          {isLoadingOlderMessages ? (
            <div>Loading...</div>
          ) : (
            <button className='Button' onClick={onLoadOlderMessages}>
              Load More
            </button>
          )}
        </ViewLoadMessagesButtonContainer>
      ) : null}
      {messageBlocks.map((block, index) => {
        const currentDate = block.messages[0].timestamp
        const previousDate =
          index > 0 ? messageBlocks[index - 1].messages[0].timestamp : null

        const showDateSeparator =
          index === 0 || (previousDate && !isSameDay(currentDate, previousDate))

        return (
          <div key={JSON.stringify(block.messages)}>
            {showDateSeparator && (
              <DateSeparator>{formatDateSeparator(currentDate)}</DateSeparator>
            )}
            <MessageBlock
              senderName={block.senderName}
              senderIcon={block.senderImg}
              timestamp={block.messages[0].timestamp}
              messages={block.messages}
              highlighted={block.senderId === highlightId}
            />
          </div>
        )
      })}
      {typingIndicator && (
        <TypingIndicatorText>{typingIndicator}</TypingIndicatorText>
      )}
    </View>
  )
}

export default MessageView
