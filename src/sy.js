import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '20px',
  position: 'relative',
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

const CardWrapper = styled(Box)({
  flexShrink: 0,
  margin: '0 10px',
  transition: 'transform 0.3s, opacity 0.3s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: theme.shadows[1],
  '&.center': {
    transform: 'scale(1.2)',
    boxShadow: theme.shadows[4],
  },
}));

const cards = [1, 2, 3, 4, 5, 6, 7, 8];

function App() {
  return (
    <Container>
      {cards.map((card, index) => (
        <CardWrapper key={index}>
          <StyledCard className={index === 3 ? 'center' : ''}>
            <CardContent>
              <Typography variant="h5">Card {card}</Typography>
              <Typography variant="body2">Some content here...</Typography>
            </CardContent>
          </StyledCard>
        </CardWrapper>
      ))}
    </Container>
  );
}

export default App;


import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '40px 60px',
  position: 'relative',
  perspective: '1000px',
  backgroundColor: '#f5f5f5',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none',
  '&::before, &::after': {
    content: '""',
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '120px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  '&::before': {
    left: 0,
    background: 'linear-gradient(to right, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 0) 100%)',
  },
  '&::after': {
    right: 0,
    background: 'linear-gradient(to left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 0) 100%)',
  },
});

const CardWrapper = styled(Box)(({ active }) => ({
  flexShrink: 0,
  width: '300px',
  margin: '0 20px',
  transformStyle: 'preserve-3d',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: active ? 1 : 0.3,
  transform: `perspective(1000px) 
              rotateY(${active ? '0' : active === false ? '-30' : '30'}deg) 
              translateZ(${active ? '50' : '0'}px)`,
}));

const StyledCard = styled(Card)({
  height: '200px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.05)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    '&::before': {
      opacity: 1,
    },
  },
  '&.active': {
    transform: 'scale(1.1)',
    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
  },
});

const CardContent = styled(Box)({
  padding: '20px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const cards = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `Card ${i + 1}`,
  content: 'Hover to explore more...',
}));

function App() {
  const containerRef = useRef(null);
  const [activeCards, setActiveCards] = useState([]);
  
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const scrollPosition = container.scrollLeft;
    const cardWidth = 340; // card width + margin
    
    const visibleCards = cards.map((_, index) => {
      const cardPosition = index * cardWidth - scrollPosition;
      const isVisible = cardPosition >= -cardWidth && cardPosition <= containerWidth;
      const isFullyVisible = cardPosition >= 0 && cardPosition <= containerWidth - cardWidth;
      
      if (!isVisible) return null;
      if (isFullyVisible) return 'active';
      return cardPosition < 0 ? 'before' : 'after';
    });
    
    setActiveCards(visibleCards);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Container ref={containerRef}>
      {cards.map((card, index) => (
        <CardWrapper
          key={card.id}
          active={activeCards[index] === 'active'}
        >
          <StyledCard className={activeCards[index] === 'active' ? 'active' : ''}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {card.content}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                height: '4px', 
                background: 'linear-gradient(90deg, #007FFF 0%, #0059B2 100%)',
                borderRadius: '2px',
                width: '60%'
              }} />
            </CardContent>
          </StyledCard>
        </CardWrapper>
      ))}
    </Container>
  );
}

export default App;
