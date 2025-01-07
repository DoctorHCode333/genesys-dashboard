import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled(Box)({
  display: 'flex',
  overflowX: 'hidden',
  position: 'relative',
  height: '300px', // Set height according to your preference
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

const CardWrapper = styled(animated.div)(({ rotate, scale }) => ({
  flexShrink: 0,
  width: '20%', // Five cards in the viewport
  height: '100%',
  transform: `perspective(1000px) rotateY(${rotate}deg) scale(${scale})`,
  transformOrigin: 'center',
  transition: 'transform 0.3s',
}));

const StyledCard = styled(Card)({
  width: '100%',
  height: '100%',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
});

const TrialCards = ({ cards = [1, 2, 3, 4, 5, 6, 7, 8] }) => {
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
      container.scrollBy({ left: -50, behavior: 'smooth' }); // Increased scroll speed
    } else if (x > width * 0.8) {
      container.scrollBy({ left: 50, behavior: 'smooth' }); // Increased scroll speed
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Container ref={containerRef} onMouseMove={handleMouseMove}>
      {cards.map((card, index) => {
        const position = (index - scrollProgress * (cards.length - 1)) / (cards.length - 1);
        const rotate = position * -30;
        const scale = 1 - Math.abs(position) * 0.3;

        return (
          <CardWrapper key={index} rotate={rotate} scale={scale}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5">Card {card}</Typography>
                <Typography variant="body2">Some content here...</Typography>
              </CardContent>
            </StyledCard>
          </CardWrapper>
        );
      })}
    </Container>
  );
};

export default TrialCards;
