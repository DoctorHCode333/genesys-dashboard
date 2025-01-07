import React, { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '20px',
  position: 'relative',
  scrollbarWidth: 'thin',
  scrollbarColor: '#888 #e0e0e0',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
    transition: 'background 0.3s',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50px',
    zIndex: 1,
  },
  '&::before': {
    left: 0,
    background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
  },
  '&::after': {
    right: 0,
    background: 'linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
  },
});

const CardWrapper = styled(Box)(({ scrollProgress }) => ({
  flexShrink: 0,
  margin: '0 10px',
  width: 'calc(100% / 5)', // Only 5 cards visible in viewport
  opacity: Math.max(0.5, 1 - Math.abs(scrollProgress) * 1.5),
  transform: `scale(${1 - Math.abs(scrollProgress) * 0.2}) translateY(${Math.abs(scrollProgress) * 20}px)`,
  transition: 'transform 0.3s, opacity 0.3s',
}));

const StyledCard = styled(Card)({
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
  },
});

const TrialCards = ({ cards = [1, 2, 3, 4, 5, 6, 7, 8] }) => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = (e) => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const scrollProgress = scrollLeft / scrollWidth;

      container.querySelectorAll('[data-index]').forEach((card, index) => {
        const cardPosition = (index - 2.5 + scrollProgress * (cards.length - 1)) / (cards.length - 1);
        card.style.setProperty('--scrollProgress', cardPosition);
      });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cards.length]);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.2) {
      container.scrollBy({ left: -10, behavior: 'smooth' });
    } else if (x > width * 0.8) {
      container.scrollBy({ left: 10, behavior: 'smooth' });
    }
  };

  return (
    <Container ref={containerRef} onMouseMove={handleMouseMove}>
      {cards.map((card, index) => (
        <CardWrapper key={index} data-index={index} scrollProgress={0}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5">Card {card}</Typography>
              <Typography variant="body2">Some content here...</Typography>
            </CardContent>
          </StyledCard>
        </CardWrapper>
      ))}
    </Container>
  );
};

export default TrialCards;
