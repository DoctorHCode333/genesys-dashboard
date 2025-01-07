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
});

const CardWrapper = styled(Box)(({ scrollProgress }) => ({
  flexShrink: 0,
  margin: '0 10px',
  width: 'calc(100% / 5)', // Only 5 cards visible at a time
  opacity: 1 - Math.abs(scrollProgress),
  transform: `scale(${1 - Math.abs(scrollProgress) * 0.25})`,
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

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const cardWidth = containerWidth / 5; // 5 cards visible
      const totalScrollWidth = container.scrollWidth;

      container.querySelectorAll('[data-index]').forEach((card, index) => {
        const cardLeft = index * cardWidth;
        const cardCenter = cardLeft + cardWidth / 2;
        const containerCenter = scrollLeft + containerWidth / 2;
        const scrollProgress = (containerCenter - cardCenter) / (containerWidth / 2);

        card.style.setProperty('--scrollProgress', scrollProgress);
      });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call to set the positions

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
