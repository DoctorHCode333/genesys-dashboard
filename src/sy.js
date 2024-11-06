import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Import your Redux action
import { setIsAllDays } from './redux/actions'; // Adjust this path as needed

// Styled components
const ToggleWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100px',
  height: '28px',
  backgroundColor: '#E0E0E0',
  borderRadius: '14px',
  position: 'relative',
  cursor: 'pointer',
}));

const LabelText = styled(Typography)(({ theme, align }) => ({
  color: '#333',
  fontWeight: 500,
  margin: align === 'left' ? '0 8px 0 0' : '0 0 0 8px',
}));

const ToggleCircle = styled(Box)(({ theme, isActive }) => ({
  position: 'absolute',
  top: '2px',
  left: isActive ? 'calc(100% - 24px)' : '2px',
  width: '24px',
  height: '24px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  transition: 'left 0.3s ease',
}));

// ToggleButton component
const ToggleButton = () => {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Dispatch the action to set the view to one day on initial render
    dispatch(setIsAllDays(false));
  }, [dispatch]);

  const toggle = () => {
    setIsActive((prev) => !prev);

    // Update the Redux state based on the toggle state
    dispatch(setIsAllDays(!isActive));
  };

  return (
    <Box display="flex" alignItems="center">
      {/* Label for One Day */}
      <LabelText align="left">One Day</LabelText>
      
      {/* Toggle Switch */}
      <ToggleWrapper onClick={toggle}>
        <ToggleCircle isActive={isActive} />
      </ToggleWrapper>
      
      {/* Label for All Days */}
      <LabelText align="right">All Days</LabelText>
    </Box>
  );
};

export default ToggleButton;
