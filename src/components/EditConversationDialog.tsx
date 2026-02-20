import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  TextInput,
  ErrorText,
  gradientTextStyle,
} from './shared/StyledComponents'

const appear = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 100%;
  }
`

const moveUp = keyframes`
  from {
    transform: translateY(20px);
  }

  to {
    transform: translateY(0);
  }
`

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(16px) brightness(85%);
  -webkit-backdrop-filter: blur(16px) brightness(85%);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 1rem;
  z-index: 100;
  animation: ${appear} 0.2s ease-out;

  @media (prefers-color-scheme: dark) {
    backdrop-filter: blur(16px) brightness(60%);
    -webkit-backdrop-filter: blur(16px) brightness(60%);
  }
`

const ModalContainer = styled(Card)`
  width: calc(100% - 2rem);
  max-width: 400px;
  padding: 1.5rem;
  margin: auto 0;
  animation: ${moveUp} 0.2s ease-out;

  @media (min-width: 30rem) {
    padding: 2rem;
  }
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  ${gradientTextStyle}
`

const FormSection = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`

const FormLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (prefers-color-scheme: dark) {
    color: #aaa;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

const StyledCancelButton = styled(SecondaryButton)`
  flex: 1;
  padding: 0.75rem 1.5rem;
`

const StyledSaveButton = styled(PrimaryButton)`
  flex: 1;
  padding: 0.75rem 1.5rem;
`

const StyledErrorText = styled(ErrorText)`
  margin-top: 1rem;
  text-align: center;
`

type EditConversationDialogProps = {
  currentName: string
  onRename: (newName: string) => Promise<void>
  onDismiss: () => void
}

const EditConversationDialog = ({
  currentName,
  onRename,
  onDismiss,
}: EditConversationDialogProps) => {
  const [name, setName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    // Prevent duplicate saves while already saving
    if (isSaving) return

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Conversation name cannot be empty.')
      return
    }

    if (trimmedName === currentName) {
      onDismiss()
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onRename(trimmedName)
      onDismiss()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to rename conversation. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <Backdrop onClick={() => !isSaving && onDismiss()}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Edit Conversation</ModalTitle>
        <FormSection>
          <FormLabel htmlFor='conversation-name'>Conversation Name</FormLabel>
          <TextInput
            id='conversation-name'
            name='conversation-name'
            type='text'
            placeholder='Enter a new name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </FormSection>
        <ButtonContainer>
          <StyledCancelButton onClick={onDismiss} disabled={isSaving}>
            Cancel
          </StyledCancelButton>
          <StyledSaveButton
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </StyledSaveButton>
        </ButtonContainer>
        {error && <StyledErrorText>{error}</StyledErrorText>}
      </ModalContainer>
    </Backdrop>
  )
}

export default EditConversationDialog
