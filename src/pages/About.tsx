import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  Card,
  PrimaryButton,
  IconContainer,
  gradientTextStyle,
} from '../components/shared/StyledComponents'

const AboutContainer = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: 40rem) {
    padding: 3rem 1rem;
  }
`

const AboutCard = styled(Card)`
  margin-bottom: 2rem;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const LogoBadge = styled(IconContainer)`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  font-weight: 700;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
  ${gradientTextStyle}

  @media (min-width: 40rem) {
    font-size: 3rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const Section = styled.section`
  margin-top: 2.5rem;

  &:first-child {
    margin-top: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  ${gradientTextStyle}
`

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin: 0 0 1rem 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`

const FeatureItem = styled.li`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 1rem;
  padding-left: 1.75rem;
  position: relative;

  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--accent-color);
    font-weight: 700;
    font-size: 1.2rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }
`

const StepList = styled.ol`
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
  margin: 0 0 1.5rem 0;
`

const StepItem = styled.li`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 1rem;
  padding-left: 2.5rem;
  position: relative;
  counter-increment: step-counter;

  &::before {
    content: counter(step-counter);
    position: absolute;
    left: 0;
    width: 1.75rem;
    height: 1.75rem;
    background: linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }

  @media (prefers-color-scheme: dark) {
    &::before {
      background: linear-gradient(135deg, #78729f 0%, #5a5479 100%);
    }
  }
`

const BackButton = styled(PrimaryButton)`
  max-width: 12rem;
  margin: 2rem auto 0;
  display: block;
`

const Strong = styled.strong`
  font-weight: 600;
  color: var(--accent-color);

  @media (prefers-color-scheme: dark) {
    color: #a39dc9;
  }
`

export default function About() {
  const appName = import.meta.env.VITE_APP_NAME || 'Web Messages'

  return (
    <AboutContainer>
      <Header>
        <LogoBadge as='img' src='/icon.png' alt={`${appName} logo`} />
        <Title>About {appName}</Title>
        <Subtitle>Simple, ephemeral messaging for everyone</Subtitle>
      </Header>

      <AboutCard>
        <Section>
          <SectionTitle>What is {appName}?</SectionTitle>
          <Paragraph>
            {appName} is a messaging web application built for seamless,
            link-based conversations without barriers to entry. Create a chat,
            share a link, and start talking - no app downloads or account
            creation required for participants.
          </Paragraph>
          <Paragraph>
            All conversations are temporary and automatically expire, ensuring
            your chats don't linger forever.
          </Paragraph>
        </Section>
        <Section>
          <SectionTitle>Key Features</SectionTitle>
          <FeatureList>
            <FeatureItem>
              <Strong>User Authentication</Strong> - Registered users can log in
              to create and manage new conversations
            </FeatureItem>
            <FeatureItem>
              <Strong>Link-Based Access</Strong> - Share conversation links with
              anyone you want to include
            </FeatureItem>
            <FeatureItem>
              <Strong>No Account Required</Strong> - Participants can join
              conversations via link without creating an account
            </FeatureItem>
            <FeatureItem>
              <Strong>Browser-Based</Strong> - Fully accessible through any
              modern web browser, no app download needed
            </FeatureItem>
            <FeatureItem>
              <Strong>Real-Time Messaging</Strong> - Send and receive messages
              instantly with live updates
            </FeatureItem>
            <FeatureItem>
              <Strong>Push Notifications</Strong> - Get notified when new
              messages arrive, even when the app is closed. Tap a notification
              to jump straight to its conversation
            </FeatureItem>
          </FeatureList>
        </Section>
        <Section>
          <SectionTitle>How It Works</SectionTitle>
          <StepList>
            <StepItem>
              An authenticated user creates a new conversation
            </StepItem>
            <StepItem>
              A unique conversation link is generated and can be shared
            </StepItem>
            <StepItem>
              Recipients access the conversation directly through the link
            </StepItem>
            <StepItem>
              Participants can send and receive messages in real-time via their
              browser
            </StepItem>
            <StepItem>
              The conversation automatically expires after a set period
            </StepItem>
          </StepList>
        </Section>
      </AboutCard>

      <Link to='/'>
        <BackButton>Back to Home</BackButton>
      </Link>
    </AboutContainer>
  )
}
