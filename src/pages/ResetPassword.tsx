import { useParams, Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

import AuthForm, { AuthToggleLink } from '../components/AuthForm'
import {
  Card,
  HelperText,
  gradientTextStyle,
} from '../components/shared/StyledComponents'

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

const Header = styled.header`
  position: relative;
  z-index: 2;
  padding: 3rem 1rem 1.5rem;
  text-align: center;

  @media (min-width: 40rem) {
    padding: 4rem 1rem 2rem;
  }
`

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  ${gradientTextStyle}
  line-height: 1.2;

  @media (min-width: 40rem) {
    font-size: 3rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.05rem;
  color: #555;
  margin: 0;

  @media (prefers-color-scheme: dark) {
    color: #bbb;
  }
`

const Container = styled.div`
  box-sizing: border-box;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  position: relative;
  z-index: 2;
`

const ResetCard = styled(Card)`
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

  @media (min-width: 40rem) {
    font-size: 0.9rem;
    margin: 1.25rem auto 0;
  }
`

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>()

  return (
    <>
      <Header>
        <Title>Reset Password</Title>
        <Subtitle>Enter your new password below.</Subtitle>
      </Header>
      <Container>
        <ResetCard>
          <AuthForm mode='reset-password' resetToken={token} />
        </ResetCard>
        <StyledHelperText>
          <AuthToggleLink as={Link} to='/login'>
            Back to login
          </AuthToggleLink>
        </StyledHelperText>
      </Container>
    </>
  )
}
