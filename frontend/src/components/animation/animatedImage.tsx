import { Box } from '@primer/react';
import { useState, useRef } from 'react';

interface Props {
  url: string;
  alt: string;
}

export const AnimatedImage = ({ url, alt }: Props) => {
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const imageHeight = imageRef.current.offsetHeight;
      containerRef.current.style.height = `${imageHeight}px`;
    }
  };

  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        ref={imageRef}
        onLoad={handleImageLoad}
        style={{
          transform: 'translate(-50%, -50%)',
          width: hovering ? '101.5%' : '100%',
          aspectRatio: 16 / 9,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transition: 'all .3s ease',
        }}
        src={url}
        alt={alt}
      />
    </Box>
  );
};
