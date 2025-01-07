import React, { useRef, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CarouselContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  alignItems: 'center',
  position: 'relative',
  height: '400px',
  padding: '40px 20%',
  backgroundColor: '#f5f5f5',
  perspective: '1500px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'orange transparent',
  '&::-webkit-scrollbar': {
    height: '8px',
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'orange',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'darkorange',
    },
  },
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '20%',
    pointerEvents: 'none',
    zIndex: 2,
  },
  '&::before': {
    left: 0,
    background: 'linear-gradient(to right, rgba(245, 245, 245, 1), rgba(245, 245, 245, 0))',
  },
  '&::after': {
    right: 0,
    background: 'linear-gradient(to left, rgba(245, 245, 245, 1), rgba(245, 245, 245, 0))',
  },
});

const CardWrapper = styled(Box)(({ transform, opacity }) => ({
  flexShrink: 0,
  width: '300px',
  height: '280px',
  margin: '0 20px',
  transform,
  opacity,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transformStyle: 'preserve-3d',
}));

const StyledCard = styled(Card)({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
  borderRadius: '15px',
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
    transform: 'translateY(-5px)',
  },
});

const StyledCardContent = styled(CardContent)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  textAlign: 'center',
});

const TrialCards = ({ cards = Array.from({ length: 9 }, (_, i) => i + 1) }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(Math.floor(cards.length / 2));
  const [isScrolling, setIsScrolling] = useState(false);

  const calculateCardStyle = (index) => {
    const distance = index - activeIndex;
    const scale = Math.max(0.6, 1 - Math.abs(distance) * 0.2);
    const opacity = Math.max(0.4, 1 - Math.abs(distance) * 0.25);
    const rotateY = distance * 10; // Rotate cards based on distance from center
    const translateZ = -Math.abs(distance) * 50; // Push cards back based on distance from center

    return {
      transform: `
        scale(${scale})
        rotateY(${rotateY}deg)
        translateZ(${translateZ}px)
      `,
      opacity,
    };
  };

  const handleScroll = () => {
    if (!containerRef.current || isScrolling) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 340; // card width + margin
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    setActiveIndex(newIndex);
  };

  const handleEdgeScroll = (direction) => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    const container = containerRef.current;
    const scrollAmount = direction * 340; // Scroll one card width
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    setTimeout(() => setIsScrolling(false), 500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial scroll to center
      container.scrollLeft = activeIndex * 340;
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <CarouselContainer ref={containerRef}>
        {cards.map((card, index) => (
          <CardWrapper key={index} {...calculateCardStyle(index)}>
            <StyledCard>
              <StyledCardContent>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                  {card}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Card Content {card}
                </Typography>
              </StyledCardContent>
            </StyledCard>
          </CardWrapper>
        ))}
      </CarouselContainer>
      
      {/* Edge scroll triggers */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '20%',
          cursor: 'pointer',
          zIndex: 1,
        }}
        onMouseEnter={() => handleEdgeScroll(-1)}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '20%',
          cursor: 'pointer',
          zIndex: 1,
        }}
        onMouseEnter={() => handleEdgeScroll(1)}
      />
    </Box>
  );
};

export default TrialCards;
