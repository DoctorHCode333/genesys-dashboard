import React, { useRef, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { styled } from '@mui/system';

// Styled components
const CarouselContainer = styled(Box)({
  display: 'flex',
  overflowX: 'hidden',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  height: '300px',
  cursor: 'pointer',
  '&:hover': {
    scrollbarWidth: 'thin',
  },
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'orange',
    borderRadius: '4px',
    transition: 'background 0.3s',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'darkorange',
  },
});

const CardWrapper = styled(animated.div)({
  flexShrink: 0,
  width: '20%', // Five cards in viewport
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  perspective: '1000px',
});

const StyledCard = styled(Card)(({ scale }) => ({
  width: '100%',
  height: '100%',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
  transform: `scale(${scale})`,
  transition: 'transform 0.3s ease',
}));

const TrialCards = ({ cards = [1, 2, 3, 4, 5, 6, 7, 8, 9] }) => {
  const containerRef = useRef();
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const totalScrollWidth = container.scrollWidth - containerWidth;
    setScrollProgress(scrollLeft / totalScrollWidth);
  };

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.2) {
      container.scrollBy({ left: -50, behavior: 'smooth' }); // Faster scrolling on the left edge
    } else if (x > width * 0.8) {
      container.scrollBy({ left: 50, behavior: 'smooth' }); // Faster scrolling on the right edge
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <CarouselContainer ref={containerRef} onMouseMove={handleMouseMove}>
      {cards.map((card, index) => {
        const position = (index - scrollProgress * (cards.length - 1)) / (cards.length - 1);
        const scale = 1 - Math.abs(position) * 0.4; // Adjusted scaling for better symmetry

        return (
          <CardWrapper key={index}>
            <StyledCard scale={scale}>
              <CardContent>
                <Typography variant="h5">Card {card}</Typography>
                <Typography variant="body2">Some content here...</Typography>
              </CardContent>
            </StyledCard>
          </CardWrapper>
        );
      })}
    </CarouselContainer>
  );
};

export default TrialCards;
