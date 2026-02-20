/// <reference types="vite-plugin-svgr/client" />

import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import CloseSVG from '../assets/close.svg?react'
import BellSVG from '../assets/bell.svg?react'
import ICON_MAP from '../util/profileIcons'
import {
  GlassmorphicContainer,
  gradientTextStyle,
} from './shared/StyledComponents'

const Container = styled(GlassmorphicContainer)`
  position: sticky;
  top: 0;
  padding: calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) 1.25rem calc(1rem + env(safe-area-inset-left, 0px));
  border: 0;
  z-index: 10;
  flex-shrink: 0;
`

const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  max-width: 40rem;
  gap: 1rem;
`

const TitleStack = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`

const Title = styled.div<{ $clickable?: boolean }>`
  font-size: 1.35rem;
  font-weight: 800;
  ${gradientTextStyle}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  transition: opacity 0.2s ease;
  user-select: none;

  ${(props) =>
    props.$clickable &&
    `
    &:hover {
      opacity: 0.7;
    }

    &:active {
      opacity: 0.5;
    }
  `}
`

const Subtitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  @media (prefers-color-scheme: dark) {
    color: #999;
  }
`

const CloseIcon = styled(CloseSVG)`
  path {
    fill: var(--accent-color);

    @media (prefers-color-scheme: dark) {
      fill: white;
    }
  }
`

const BellIcon = styled(BellSVG)`
  path {
    fill: var(--accent-color);

    @media (prefers-color-scheme: dark) {
      fill: white;
    }
  }
`

const ProfileChip = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 4px 12px;
  border-radius: 20px;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    background: linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 61, 88, 0.25);
  }

  &:hover span {
    color: white;
  }

  &:hover img {
    filter: invert(1);
  }

  &:hover path {
    fill: white;
  }

  &:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: dark) {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    img {
      filter: invert(0.8);
    }

    &:hover {
      background: linear-gradient(135deg, #78729f 0%, #5a5479 100%);
      box-shadow: 0 4px 12px rgba(120, 114, 159, 0.3);
    }
  }
`

const ProfileAvatar = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  background-color: transparent;
  transition: filter 0.2s ease;
`

const ProfileName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  transition: color 0.2s ease;

  @media (max-width: 400px) {
    max-width: 60px;
  }

  @media (prefers-color-scheme: dark) {
    color: #e5e5e5;
  }
`

const ChevronIcon = styled.span`
  font-size: 0.75rem;
  opacity: 0.5;
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease;
`

const IdentityBadge = styled.span`
  font-size: 0.7rem;
  padding: 3px 7px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(64, 61, 88, 0.15) 0%,
    rgba(90, 84, 121, 0.15) 100%
  );
  color: var(--accent-color);
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s ease;

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      135deg,
      rgba(120, 114, 159, 0.2) 0%,
      rgba(90, 84, 121, 0.2) 100%
    );
    color: #a39dc9;
  }
`

const NavBarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: linear-gradient(135deg, var(--accent-color) 0%, #5a5479 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 61, 88, 0.25);
  }

  &:hover path {
    fill: white;
  }

  &:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: dark) {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
      background: linear-gradient(135deg, #78729f 0%, #5a5479 100%);
      box-shadow: 0 4px 12px rgba(120, 114, 159, 0.3);
    }
  }
`

type NavBar = {
  title: string
  subtitle?: string
  onUserClick: () => void
  userName?: string
  userAvatar?: string
  isAnonymous?: boolean
  onNotificationToggle?: () => void
  onRenameClick?: () => void
}

const NavBar = ({
  title = '',
  subtitle,
  onUserClick,
  userName,
  userAvatar,
  isAnonymous = false,
  onNotificationToggle,
  onRenameClick,
}: NavBar) => {
  const navigate = useNavigate()
  const avatarSrc = userAvatar ? ICON_MAP[userAvatar] : undefined

  return (
    <Container>
      <Content>
        <TitleStack>
          <Title
            $clickable={!!onRenameClick}
            onClick={onRenameClick}
            title={onRenameClick ? 'Click to rename conversation' : undefined}
          >
            {title}
          </Title>
          {subtitle && <Subtitle>⏱ {subtitle}</Subtitle>}
        </TitleStack>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {userName && avatarSrc && (
            <ProfileChip
              onClick={onUserClick}
              title={
                isAnonymous
                  ? 'Anonymous Identity - Click to edit'
                  : 'Account Identity - Click to edit'
              }
            >
              <ProfileAvatar src={avatarSrc} alt={userName} />
              <ProfileName>{userName}</ProfileName>
              {!isAnonymous && <IdentityBadge>✓</IdentityBadge>}
              <ChevronIcon>›</ChevronIcon>
            </ProfileChip>
          )}
          {onNotificationToggle && (
            <NavBarButton
              onClick={onNotificationToggle}
              title='Toggle Notifications'
            >
              <BellIcon />
            </NavBarButton>
          )}
          <NavBarButton onClick={() => navigate('/')} title='Go to Home'>
            <CloseIcon />
          </NavBarButton>
        </div>
      </Content>
    </Container>
  )
}

export default NavBar
