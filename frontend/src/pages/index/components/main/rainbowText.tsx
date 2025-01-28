export const RainbowText = ({ gradientSettings, children }: any) => {
  const gradientAnimationStyles = {
    background: `linear-gradient(${gradientSettings})`,
    backgroundSize: '300%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    animation: 'gradient-animation 5s infinite linear alternate',
  };

  return <span style={gradientAnimationStyles}>{children}</span>;
};
