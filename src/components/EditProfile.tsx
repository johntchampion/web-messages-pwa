import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { UserType } from '../util/userContext'
import ICON_MAP from '../util/profileIcons'
import restAPI from '../util/rest'
import type { RootState, AppDispatch } from '../store/store'
import { updateUserProfile as updateUserProfileAction } from '../store/slices/auth'
import MessageView from './MessageView'
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  TextInput,
  ErrorText,
  HelperText,
  gradientTextStyle,
} from './shared/StyledComponents'
import AuthForm, { AuthToggleText, AuthToggleLink } from './AuthForm'

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
  max-width: 360px;
  padding: 1.5rem;
  margin: auto 0;
  animation: ${moveUp} 0.2s ease-out;

  @media (min-width: 30rem) {
    padding: 2rem;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  ${gradientTextStyle}
`

const IdentityBadge = styled.div`
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(64, 61, 88, 0.15) 0%,
    rgba(90, 84, 121, 0.15) 100%
  );
  color: var(--accent-color);
  font-weight: 600;
  white-space: nowrap;

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      135deg,
      rgba(120, 114, 159, 0.2) 0%,
      rgba(90, 84, 121, 0.2) 100%
    );
    color: #a39dc9;
  }
`

const FormSection = styled.div`
  margin-top: 1rem;
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

const FormInfo = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;

  @media (prefers-color-scheme: dark) {
    color: #e5e5e5;
  }
`

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 52px 52px;
  gap: 0.75rem;
  padding: 1rem 0;
`

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const AvatarOption = styled.button<{ $selected?: boolean }>`
  height: 52px;
  width: 52px;
  border-radius: 26px;
  background: ${(props) =>
    props.$selected
      ? 'linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%)'
      : '#f5f5f5'};
  border: ${(props) =>
    props.$selected ? 'none' : '3px solid rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;

  &:hover {
    border-color: var(--accent-color);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  & img {
    object-fit: contain;
    height: 36px;
    width: 36px;
    filter: ${(props) =>
      props.$selected ? 'brightness(0) invert(1)' : 'none'};
  }

  @media (prefers-color-scheme: dark) {
    background: ${(props) =>
      props.$selected
        ? 'linear-gradient(135deg, #78729f 0%, #5a5479 100%)'
        : '#2a2a2a'};
    border-color: ${(props) =>
      props.$selected ? '#78729f' : 'rgba(255, 255, 255, 0.1)'};

    & img {
      filter: ${(props) =>
        props.$selected
          ? 'brightness(0) invert(1)'
          : 'brightness(0) invert(1) opacity(0.6)'};
    }
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
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

const DisclaimerSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  @media (prefers-color-scheme: dark) {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
`

const StyledHelperText = styled(HelperText)`
  font-size: 0.85rem;
  text-align: left;
  line-height: 1.5;
`

const ToggleButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: var(--accent-color);
  }

  @media (prefers-color-scheme: dark) {
    color: #999;

    &:hover {
      color: #a39dc9;
    }
  }
`

const Caret = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
`

const ItalicText = styled.span`
  font-style: italic;
  font-weight: 400;
`

const EditProfile = ({
  user,
  onChangeUser,
  onDismiss,
}: {
  user: UserType
  onChangeUser: (value: UserType) => void
  onDismiss: () => void
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)
  const authUser = authState.user
  const [name, setName] = useState(authUser?.displayName || user?.name || '')
  const [avatar, setAvatar] = useState(
    authUser?.profilePicURL || user?.avatar || ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previousName] = useState(user?.name || '')
  const [previousAvatar] = useState(user?.avatar || '')
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  // Auth form state
  const [viewMode, setViewMode] = useState<'profile' | 'auth'>('profile')
  const [authFormMode, setAuthFormMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    setName(authUser?.displayName || user?.name || '')
    setAvatar(authUser?.profilePicURL || user?.avatar || '')
  }, [authUser, user])

  // Close modal when auth succeeds
  useEffect(() => {
    if (authUser && viewMode === 'auth') {
      onDismiss()
    }
  }, [authUser, viewMode, onDismiss])

  const handleSave = async () => {
    if (authUser) {
      try {
        setIsSaving(true)
        setError(null)
        await restAPI.put('/auth/update-profile', {
          displayName: name,
          profilePicURL: avatar,
        })
        dispatch(
          updateUserProfileAction({
            displayName: name,
            profilePicURL: avatar,
          })
        )
        onDismiss()
      } catch (err) {
        console.error(err)
        setError('Unable to update profile. Please try again.')
      } finally {
        setIsSaving(false)
      }
      return
    }

    onChangeUser({ name, avatar })
  }

  const toggleAuthFormMode = () => {
    setAuthFormMode((prev) => (prev === 'login' ? 'signup' : 'login'))
  }

  const switchToAuthView = () => {
    setViewMode('auth')
  }

  const switchToProfileView = () => {
    setViewMode('profile')
  }

  const hasChangedProfile = authUser
    ? name !== (authUser.displayName || '') ||
      avatar !== (authUser.profilePicURL || '')
    : name !== previousName || avatar !== previousAvatar
  const isFirstTimeUser = !authUser && previousName.length === 0

  return (
    <Backdrop onClick={onDismiss}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <ModalTitle>
            {viewMode === 'auth'
              ? authFormMode === 'login'
                ? 'Log In'
                : 'Sign Up'
              : isFirstTimeUser
              ? 'Set Your Name'
              : 'Edit profile'}
          </ModalTitle>
          {viewMode === 'profile' && (
            <IdentityBadge>
              {authUser ? 'Account Identity' : 'Anonymous Identity'}
            </IdentityBadge>
          )}
        </Header>

        {viewMode === 'auth' ? (
          <>
            <AuthForm
              mode={authFormMode}
              onCancel={switchToProfileView}
              cancelButtonText='Back'
            />
            <DisclaimerSection>
              <AuthToggleText>
                {authFormMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <AuthToggleLink onClick={toggleAuthFormMode}>
                      Sign up here
                    </AuthToggleLink>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <AuthToggleLink onClick={toggleAuthFormMode}>
                      Log in here
                    </AuthToggleLink>
                  </>
                )}
              </AuthToggleText>
            </DisclaimerSection>
          </>
        ) : (
          <>
            <FormSection>
              <FormLabel htmlFor='username'>Display Name</FormLabel>
              <TextInput
                id='username'
                name='username'
                type='text'
                placeholder='heyitsme'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormSection>
            <FormSection>
              <FormLabel>Avatar</FormLabel>
              <AvatarGrid>
                {Object.keys(ICON_MAP).map((a) => (
                  <AvatarContainer key={a}>
                    <AvatarOption
                      $selected={a === avatar}
                      onClick={() => setAvatar(a)}
                    >
                      <img src={ICON_MAP[a]} alt={a} />
                    </AvatarOption>
                  </AvatarContainer>
                ))}
              </AvatarGrid>
            </FormSection>
            <ButtonContainer>
              <StyledCancelButton onClick={onDismiss}>
                Cancel
              </StyledCancelButton>
              <StyledSaveButton
                onClick={handleSave}
                disabled={
                  isFirstTimeUser
                    ? !name || !avatar || isSaving
                    : !hasChangedProfile || isSaving
                }
              >
                {isSaving ? 'Saving…' : isFirstTimeUser ? 'Join Chat' : 'Save'}
              </StyledSaveButton>
            </ButtonContainer>
            {error && <StyledErrorText>{error}</StyledErrorText>}

            {isFirstTimeUser && (
              <DisclaimerSection>
                <AuthToggleText>
                  Already have an account?{' '}
                  <AuthToggleLink onClick={switchToAuthView}>
                    Sign in
                  </AuthToggleLink>
                </AuthToggleText>
              </DisclaimerSection>
            )}
          </>
        )}

        {viewMode === 'profile' && authUser && (
          <DisclaimerSection>
            <ToggleButton onClick={() => setShowDisclaimer(!showDisclaimer)}>
              <Caret $isOpen={showDisclaimer}>▶</Caret>
              Show Account Information
            </ToggleButton>
            {showDisclaimer && (
              <>
                <FormSection>
                  <FormLabel>Username</FormLabel>
                  <FormInfo>@{authUser.username}</FormInfo>
                </FormSection>
                {authUser.email && (
                  <FormSection>
                    <FormLabel>Email</FormLabel>
                    <FormInfo>{authUser.email}</FormInfo>
                  </FormSection>
                )}
              </>
            )}
          </DisclaimerSection>
        )}
        {viewMode === 'profile' && !authUser && !isFirstTimeUser && (
          <DisclaimerSection>
            <ToggleButton onClick={() => setShowDisclaimer(!showDisclaimer)}>
              <Caret $isOpen={showDisclaimer}>▶</Caret>
              About Anonymous Identity
              <ItalicText>
                {hasChangedProfile && previousName && previousAvatar
                  ? '(updated)'
                  : ''}
              </ItalicText>
            </ToggleButton>
            {showDisclaimer && (
              <>
                <StyledHelperText>
                  You're using an Anonymous Identity. If you switch devices,
                  reset your browser, or change your info, your earlier messages
                  won't appear as "you." Also, if someone else in the chat
                  chooses the same name and picture, their messages may look
                  like yours on your device. Signing in will switch to your
                  Account Identity and keep your profile consistent and unique
                  going forward.
                </StyledHelperText>
                {hasChangedProfile &&
                  previousName &&
                  previousAvatar &&
                  name &&
                  avatar && (
                    <MessageView
                      highlightId='new-preview-user'
                      showLoadOlderMessagesButton={false}
                      isLoadingOlderMessages={false}
                      onLoadOlderMessages={() => {}}
                      margin='24px auto 0 auto'
                      messages={[
                        {
                          id: 'preview-message-1',
                          userId: 'old-preview-user',
                          timestamp: new Date(),
                          content: `This is how your earlier messages will look with your previous name and picture.`,
                          type: 'text',
                          userProfilePic: previousAvatar,
                          userFullName: previousName,
                          delivered: 'delivered',
                        },
                        {
                          id: 'preview-message-2',
                          userId: 'new-preview-user',
                          timestamp: new Date(),
                          content: `And this is how your messages will look now, with your updated identity.`,
                          type: 'text',
                          userProfilePic: avatar,
                          userFullName: name,
                          delivered: 'delivered',
                        },
                      ]}
                    />
                  )}
              </>
            )}
          </DisclaimerSection>
        )}
      </ModalContainer>
    </Backdrop>
  )
}

export default EditProfile
