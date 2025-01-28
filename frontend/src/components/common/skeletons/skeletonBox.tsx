import React from 'react';

import styled, { keyframes } from 'styled-components';

interface SkeletonBoxProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

// Shimmer effect animation
const shimmer = keyframes`
  100% {
    left: 100%;
  }
`;

// Styled Skeleton Box component with typed props
const SkeletonBoxWrapper = styled.div<SkeletonBoxProps>`
  background: #0e1218;
  border-radius: ${({ borderRadius }) => borderRadius || '22px'};
  position: relative;
  overflow: hidden;
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '20px'};
  margin: 0px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      90deg,
      rgba(16, 20, 26, 0) 0%,
      rgba(16, 20, 26, 1) 50%,
      rgba(16, 20, 26, 0) 100%
    );
    animation: ${shimmer} 1.5s infinite;
  }
`;

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius,
}) => {
  return (
    <SkeletonBoxWrapper
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
};
