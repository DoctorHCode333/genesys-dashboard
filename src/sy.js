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
