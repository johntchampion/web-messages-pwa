/// <reference types="vite-plugin-svgr/client" />

import { useRef, useState } from 'react'
import styled from 'styled-components'

import FileUploadSVG from '../assets/file-upload.svg?react'
import { GlassmorphicContainer } from './shared/StyledComponents'

const Container = styled(GlassmorphicContainer)<{ $active?: boolean }>`
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  z-index: 10;
`

const Content = styled.div<{ $uploadEnabled: boolean; $keyboardVisible: boolean }>`
  width: calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right));
  display: grid;
  grid-template-columns: ${(props) =>
    props.$uploadEnabled ? '0px 44px 1fr 0px' : '0px 1fr 0px'};
  column-gap: 10px;
  max-width: 40rem;
  margin: auto;
  padding: 1rem 0 ${(props) => props.$keyboardVisible ? '1rem' : 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'} 0;
`

const UploadButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
`

const ComposeArea = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin: auto;
  background-color: transparent;
`

export const ComposeInput = styled.textarea`
  appearance: none;
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  min-height: 44px;
  max-height: 200px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
  cursor: text;
  color: #222;
  resize: none;
  overflow-y: auto;
  vertical-align: middle;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 4px 16px rgba(64, 61, 88, 0.2),
      0 0 0 4px rgba(64, 61, 88, 0.1);
    transform: translateY(-1px);
  }

  @media (prefers-color-scheme: dark) {
    background-color: #2a2a2a;
    color: white;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

    &::placeholder {
      color: #888;
    }

    &:focus {
      background-color: #333;
      border-color: #78729f;
      box-shadow: 0 4px 16px rgba(120, 114, 159, 0.3),
        0 0 0 4px rgba(120, 114, 159, 0.15);
      transform: translateY(-1px);
    }
  }
`

const FileUploadIcon = styled(FileUploadSVG)`
  path {
    fill: var(--accent-color);
    transition: fill 0.2s ease;
  }
`

const StyledUploadButton = styled.button`
  display: inline-block;
  height: 44px;
  width: 44px;
  border-radius: 12px;
  border: none;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 61, 88, 0.25);

    path {
      fill: white;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-color-scheme: dark) {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #78729f 0%, #5a5479 100%);
      box-shadow: 0 4px 12px rgba(120, 114, 159, 0.3);

      path {
        fill: white;
      }
    }
  }
`

type ComposeBox = {
  sendMessage: (m: string) => void
  becameActive: () => void
  onUploadFile: () => void
  disableUpload: boolean
  onTyping?: () => void
  keyboardVisible?: boolean
}

const ComposeBox = ({
  sendMessage,
  becameActive,
  onUploadFile,
  disableUpload,
  onTyping,
  keyboardVisible = false,
}: ComposeBox) => {
  const [message, setMessage] = useState<string>('')
  const [active, setActive] = useState<boolean>(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current
    if (textarea) {
      // Set to auto to force accurate scrollHeight recalculation
      textarea.style.height = 'auto'

      // Get the accurate scrollHeight for current content
      const scrollHeight = textarea.scrollHeight

      // If content is empty or fits in one line, use minimum 44px
      // Check both scrollHeight and if there are newlines in the content
      const hasMultipleLines = message.includes('\n')
      const needsExpansion = scrollHeight > 50 || hasMultipleLines

      if (needsExpansion) {
        textarea.style.height = `${Math.min(scrollHeight, 200)}px`
      } else {
        textarea.style.height = '44px'
      }
    }
  }

  return (
    <Container $active={active}>
      <Content $uploadEnabled={!disableUpload} $keyboardVisible={keyboardVisible}>
        <div></div>
        <input
          type='file'
          onChange={onUploadFile}
          ref={uploadRef}
          style={{ display: 'none' }}
        />
        {!disableUpload && (
          <UploadButtonContainer>
            <StyledUploadButton
              disabled={disableUpload}
              onClick={() => {
                uploadRef.current && uploadRef.current.click()
              }}
            >
              <FileUploadIcon style={{ transform: 'translateY(1px)' }} />
            </StyledUploadButton>
          </UploadButtonContainer>
        )}
        <ComposeArea>
          <ComposeInput
            rows={1}
            placeholder='Message'
            value={message}
            enterKeyHint='send'
            onChange={(event) => {
              setMessage(event.target.value)
              adjustTextareaHeight()
              onTyping?.()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                if (message.trim()) {
                  sendMessage(message)
                  setMessage('')
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.style.height = '44px'
                    }
                  }, 0)
                  inputRef.current && inputRef.current.focus()
                }
              }
            }}
            onFocus={() => {
              setActive(true)
              becameActive()
            }}
            onBlur={() => {
              setActive(false)
            }}
            ref={inputRef}
          />
        </ComposeArea>
        <div></div>
      </Content>
    </Container>
  )
}

export default ComposeBox
