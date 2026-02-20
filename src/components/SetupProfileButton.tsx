import styled from 'styled-components'
import { GlassmorphicContainer } from './shared/StyledComponents'

const SetupProfileContainer = styled(GlassmorphicContainer)`
  position: sticky;
  bottom: 0;
  height: calc(76px + env(safe-area-inset-bottom));
  flex-shrink: 0;
  z-index: 10;

  @media (min-width: 40rem) {
    height: 96px;
  }
`

const SetupProfileContent = styled.div`
  width: calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right));
  display: grid;
  grid-template-columns: 0px 1fr 0px;
  column-gap: 10px;
  max-width: 40rem;
  margin: auto;
`

const SetupProfileButtonArea = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 76px;
  margin: auto;
  background-color: transparent;
`

const StyledSetupProfileButton = styled.button`
  height: 44px;
  width: 100%;
  border-radius: 44px;
  background-color: transparent;
  padding: 0 16px;
  text-align: center;
  cursor: pointer;
  color: var(--accent-color);
  appearance: none;
  drop-shadow: none;
  border: 2px solid var(--accent-color);
  font-size: 0.85rem;
  font-weight: 500;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`

type SetupProfileButtonProps = {
  onClick: () => void
}

const SetupProfileButton = ({ onClick }: SetupProfileButtonProps) => {
  return (
    <SetupProfileContainer>
      <SetupProfileContent>
        <div></div>
        <SetupProfileButtonArea>
          <StyledSetupProfileButton onClick={onClick}>
            Set your name to send messages
          </StyledSetupProfileButton>
        </SetupProfileButtonArea>
        <div></div>
      </SetupProfileContent>
    </SetupProfileContainer>
  )
}

export default SetupProfileButton
