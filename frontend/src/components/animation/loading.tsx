import styled, { keyframes } from 'styled-components';

// Keyframes for the spinner animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled component for the loading container
const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh; /* Full page height for centering */
`;

// Styled component for the loading spinner
const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 8px solid rgba(0, 0, 0, 0.15);
  border-top: 8px solid #c2c2c2;
  border-radius: 50%;
  animation: ${spin} 1.3s linear infinite;
`;

const Loading = () => {
  return (
    <LoadingContainer>
      <LoadingSpinner />
    </LoadingContainer>
  );
};

export default Loading;
