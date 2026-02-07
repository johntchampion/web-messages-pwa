import { useState } from 'react'
import type { FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { logIn, signUp } from '../store/slices/auth'
import type { RootState, AppDispatch } from '../store/store'
import restAPI from '../util/rest'
import {
  PrimaryButton,
  SecondaryButton,
  TextInput,
  ErrorText,
} from './shared/StyledComponents'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormSection = styled.div`
  margin: 0;
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

const StyledErrorText = styled(ErrorText)`
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  text-align: center;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0rem;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  flex: 1;
  padding: 0.875rem 1rem;
`

const StyledSecondaryButton = styled(SecondaryButton)`
  flex: 1;
  padding: 0.875rem 1rem;
`

interface ForgotPasswordFormProps {
  onCancel?: () => void
  cancelButtonText?: string
}

function ForgotPasswordForm({
  onCancel,
  cancelButtonText = 'Cancel',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      setFormError('Enter your email address.')
      return
    }

    setFormError(null)
    setResetError(null)
    setResetLoading(true)

    try {
      await restAPI.put('/auth/request-new-password', { email: email.trim() })
      setResetSuccess(true)
    } catch (error: any) {
      setResetError(error.response?.data?.message || error.message || 'Password reset request failed')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {resetSuccess ? (
        <StyledErrorText style={{ background: '#d4edda', color: '#155724', borderLeft: '4px solid #28a745' }}>
          Check your email for password reset instructions.
        </StyledErrorText>
      ) : (
        <>
          <FormSection>
            <FormLabel htmlFor='auth-email'>Email</FormLabel>
            <TextInput
              id='auth-email'
              type='email'
              placeholder='john@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete='email'
            />
          </FormSection>
          {(formError || resetError) && (
            <StyledErrorText>{formError || resetError}</StyledErrorText>
          )}
          <ButtonContainer>
            {onCancel && (
              <StyledSecondaryButton type='button' onClick={onCancel}>
                {cancelButtonText}
              </StyledSecondaryButton>
            )}
            <StyledPrimaryButton
              type='submit'
              disabled={resetLoading}
              style={onCancel ? {} : { flex: 1 }}
            >
              {resetLoading ? 'Sending…' : 'Send Reset Link'}
            </StyledPrimaryButton>
          </ButtonContainer>
        </>
      )}
    </Form>
  )
}

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password'
  onCancel?: () => void
  cancelButtonText?: string
}

export default function AuthForm({
  mode,
  onCancel,
  cancelButtonText = 'Cancel',
}: AuthFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  if (mode === 'forgot-password') {
    return (
      <ForgotPasswordForm
        onCancel={onCancel}
        cancelButtonText={cancelButtonText}
      />
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'login') {
      if (!username.trim() || !password.trim()) {
        setFormError('Enter your username and password.')
        return
      }
      setFormError(null)
      dispatch(logIn({ username: username.trim(), password: password.trim() }))
    } else {
      if (!displayName.trim()) {
        setFormError('Enter your display name.')
        return
      }
      if (!username.trim()) {
        setFormError('Enter a username.')
        return
      }
      if (!password.trim()) {
        setFormError('Enter a password.')
        return
      }
      setFormError(null)
      dispatch(
        signUp({
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim() || null,
          password: password.trim(),
        })
      )
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {mode === 'signup' && (
        <>
          <FormSection>
            <FormLabel htmlFor='auth-displayname'>Display Name</FormLabel>
            <TextInput
              id='auth-displayname'
              type='text'
              placeholder='John Doe'
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete='name'
            />
          </FormSection>
          <FormSection>
            <FormLabel htmlFor='auth-email'>Email (Optional)</FormLabel>
            <TextInput
              id='auth-email'
              type='email'
              placeholder='john@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete='email'
            />
          </FormSection>
        </>
      )}
      <FormSection>
        <FormLabel htmlFor='auth-username'>Username</FormLabel>
        <TextInput
          id='auth-username'
          type='text'
          placeholder={
            mode === 'login' ? 'Enter username' : 'Choose a username'
          }
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete='username'
        />
      </FormSection>
      <FormSection>
        <FormLabel htmlFor='auth-password'>Password</FormLabel>
        <TextInput
          id='auth-password'
          type='password'
          placeholder={
            mode === 'login' ? 'Enter password' : 'Create a password'
          }
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </FormSection>
      {(formError || authState.error) && (
        <StyledErrorText>{formError || authState.error}</StyledErrorText>
      )}
      <ButtonContainer>
        {onCancel && (
          <StyledSecondaryButton type='button' onClick={onCancel}>
            {cancelButtonText}
          </StyledSecondaryButton>
        )}
        <StyledPrimaryButton
          type='submit'
          disabled={authState.isLoading}
          style={onCancel ? {} : { flex: 1 }}
        >
          {authState.isLoading
            ? mode === 'login'
              ? 'Signing in…'
              : 'Creating account…'
            : mode === 'login'
            ? 'Log In'
            : 'Sign Up'}
        </StyledPrimaryButton>
      </ButtonContainer>
    </Form>
  )
}

export const AuthToggleText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  margin-top: 0.5rem;
  text-align: center;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

export const AuthToggleLink = styled.button`
  appearance: none;
  border: none;
  background: none;
  color: var(--accent-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;

  &:hover {
    border-bottom-color: var(--accent-color);
  }

  @media (prefers-color-scheme: dark) {
    color: #a39dc9;

    &:hover {
      border-bottom-color: #a39dc9;
    }
  }
`
