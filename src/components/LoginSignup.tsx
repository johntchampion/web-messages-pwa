import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { Card, HelperText } from './shared/StyledComponents'
import AuthForm, { AuthToggleLink } from './AuthForm'

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const AuthCard = styled(Card)`
  box-sizing: border-box;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
  max-width: 28rem;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: ${slideUp} 0.4s ease-out;

  @media (min-width: 40rem) {
    padding: 2rem 1.5rem;
  }

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(to bottom, #2a2a2a 0%, #1f1f1f 100%);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
`

const StyledHelperText = styled(HelperText)`
  margin: 1rem auto 0;
  max-width: 32rem;
  line-height: 1.8rem;

  @media (min-width: 40rem) {
    font-size: 0.9rem;
    margin: 1.25rem auto 0;
  }
`

export default function LoginSignup() {
  const [formMode, setFormMode] = useState<
    'login' | 'signup' | 'forgot-password'
  >('login')

  const toggleFormMode = () => {
    setFormMode((prev) => (prev === 'login' ? 'signup' : 'login'))
  }

  return (
    <>
      <AuthCard>
        <AuthForm mode={formMode} />
      </AuthCard>
      <StyledHelperText>
        {formMode === 'login' ? (
          <>
            Don't have an account?{' '}
            <AuthToggleLink onClick={toggleFormMode}>
              Sign up here
            </AuthToggleLink>
            <br />
            <AuthToggleLink onClick={() => setFormMode('forgot-password')}>
              Forgot password?
            </AuthToggleLink>
          </>
        ) : formMode === 'signup' ? (
          <>
            Already have an account?{' '}
            <AuthToggleLink onClick={toggleFormMode}>
              Log in here
            </AuthToggleLink>
          </>
        ) : (
          <>
            Remember your password?{' '}
            <AuthToggleLink onClick={() => setFormMode('login')}>
              Log in here
            </AuthToggleLink>
          </>
        )}
      </StyledHelperText>
    </>
  )
}
