import React, { useRef, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CarouselContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  alignItems: 'center',
  position: 'relative',
  height: '500px',                    // Increased height for better visibility
  padding: '40px 25%',                // Increased padding for better centering
  backgroundColor: '#f5f5f5',
  perspective: '2000px',              // Increased perspective for stronger 3D effect
  
  // Enhanced scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: 'orange transparent',
  '&::-webkit-scrollbar': {
    height: '10px',                   // Slightly larger scrollbar
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'orange',
    borderRadius: '5px',
    '&:hover': {
      backgroundColor: 'darkorange',
    },
  },
  
  // Enhanced gradient edges
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '25%',                     // Matched with padding
    pointerEvents: 'none',
    zIndex: 2,
  },
  '&::before': {
    left: 0,
    background: 'linear-gradient(to right, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 0.5) 50%, rgba(245, 245, 245, 0) 100%)',
  },
  '&::after': {
    right: 0,
    background: 'linear-gradient(to left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 0.5) 50%, rgba(245, 245, 245, 0) 100%)',
  },
});

const CardWrapper = styled(Box)(({ transform, opacity }) => ({
  flexShrink: 0,
  width: '320px',                     // Slightly wider cards
  height: '400px',                    // Taller cards
  margin: '0 30px',                   // Increased margin between cards
  transform,
  opacity,
  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', // Slower, smoother transition
  transformStyle: 'preserve-3d',
  transformOrigin: 'center center',   // Ensures scaling from center
}));

const StyledCard = styled(Card)({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
  borderRadius: '20px',               // More rounded corners
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  transition: 'all 0.4s ease',
  '&:hover': {
    boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
    transform: 'translateY(-8px) scale(1.02)', // Enhanced hover effect
  },
});

const StyledCardContent = styled(CardContent)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '30px',                    // More internal padding
  textAlign: 'center',
});

const TrialCards = ({ cards = Array.from({ length: 9 }, (_, i) => i + 1) }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(Math.floor(cards.length / 2));
  const [isScrolling, setIsScrolling] = useState(false);

  const calculateCardStyle = (index) => {
    const distance = index - activeIndex;
    
    // Enhanced scaling and opacity effects
    const scale = Math.max(0.65,                   // Increased minimum scale
                          1 - Math.abs(distance) * 0.15);  // Reduced scale drop-off
    
    const opacity = Math.max(0.5,                  // Increased minimum opacity
                           1 - Math.abs(distance) * 0.2);  // Reduced opacity drop-off
    
    // Enhanced 3D positioning
    const rotateY = distance * 12;                 // Increased rotation
    const translateZ = -Math.abs(distance) * 60;   // Increased depth
    const translateX = distance * 2;               // Reduced X-offset for better centering

    return {
      transform: `
        translateX(${translateX}px)
        scale(${scale})
        rotateY(${rotateY}deg)
        translateZ(${translateZ}px)
        ${Math.abs(distance) > 2 ? 'translateY(40px)' : ''}  // Push far cards down slightly
      `,
      opacity,
    };
  };

  const handleScroll = () => {
    if (!containerRef.current || isScrolling) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 380;            // Adjusted for new card width + margin
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    // Prevent overshooting at ends
    if (newIndex >= 0 && newIndex < cards.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleEdgeScroll = (direction) => {
    if (!containerRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const container = containerRef.current;
    const cardWidth = 380;
    
    // Smooth multi-card scrolling
    container.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth'
    });

    setTimeout(() => setIsScrolling(false), 600); // Matched with transition time
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Improved initial centering
      requestAnimationFrame(() => {
        container.scrollLeft = activeIndex * 380;
      });
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <CarouselContainer ref={containerRef}>
        {cards.map((card, index) => (
          <CardWrapper key={index} {...calculateCardStyle(index)}>
            <StyledCard>
              <StyledCardContent>
                <Typography variant="h3" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: '#333',
                  transform: 'translateZ(50px)', // Pop out text
                }}>
                  {card}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#666',
                  transform: 'translateZ(30px)', // Pop out text less
                }}>
                  Card Content {card}
                </Typography>
              </StyledCardContent>
            </StyledCard>
          </CardWrapper>
        ))}
      </CarouselContainer>
      
      {/* Wider edge trigger areas with visual indicator */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '25%',
          cursor: 'pointer',
          zIndex: 1,
          background: 'linear-gradient(to right, rgba(0,0,0,0.02), transparent)',
          transition: 'background 0.3s',
          '&:hover': {
            background: 'linear-gradient(to right, rgba(0,0,0,0.05), transparent)',
          }
        }}
        onMouseEnter={() => handleEdgeScroll(-1)}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '25%',
          cursor: 'pointer',
          zIndex: 1,
          background: 'linear-gradient(to left, rgba(0,0,0,0.02), transparent)',
          transition: 'background 0.3s',
          '&:hover': {
            background: 'linear-gradient(to left, rgba(0,0,0,0.05), transparent)',
          }
        }}
        onMouseEnter={() => handleEdgeScroll(1)}
      />
    </Box>
  );
};

export default TrialCards;
