Creating a custom toggle button component with the desired behavior in React using Material-UI or PrimeReact involves creating a layout where a rounded slider moves left and right on a fixed background. Additionally, this toggle should display specific text on the left and the days of the week on the right.

Below, I'll provide an example of implementing this component using Material-UI with some basic styling to achieve the required functionality.

Step 1: Install Material-UI (if not already installed)

To start, you’ll need to have Material-UI installed in your project. You can install it via npm or yarn.

npm install @mui/material @emotion/react @emotion/styled

Step 2: Create the ToggleButton Component

Here's the code for the ToggleButton component that should meet your requirements. This component includes a styled background, a circular handle that moves from left to right, a placeholder text on the left, and the days of the week on the right.

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Styled components
const ToggleWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '200px',
  height: '40px',
  backgroundColor: '#E0E0E0',
  borderRadius: '20px',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
}));

const ToggleText = styled(Typography)(({ theme, isActive }) => ({
  position: 'absolute',
  top: '50%',
  left: isActive ? 'auto' : '10px',
  right: isActive ? '10px' : 'auto',
  transform: 'translateY(-50%)',
  color: isActive ? theme.palette.primary.main : '#333',
  fontWeight: 500,
}));

const ToggleCircle = styled(Box)(({ theme, isActive }) => ({
  position: 'absolute',
  top: '50%',
  left: isActive ? 'calc(100% - 34px)' : '2px',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '36px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  transition: 'left 0.3s ease',
}));

// ToggleButton component
const ToggleButton = () => {
  const [isActive, setIsActive] = useState(false);

  const toggle = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <ToggleWrapper onClick={toggle}>
      {/* Placeholder text or label on the left */}
      <ToggleText isActive={!isActive}>Placeholder</ToggleText>
      
      {/* Days on the right */}
      <ToggleText isActive={isActive}>All Days</ToggleText>
      
      {/* Toggle circle that moves left or right */}
      <ToggleCircle isActive={isActive} />
    </ToggleWrapper>
  );
};

export default ToggleButton;

Explanation

1. ToggleWrapper: This is the main container of the toggle switch. It’s a rectangular background with rounded corners and a gray color. We use overflow: hidden to ensure that the circle remains contained within the rectangle.


2. ToggleText: This component represents the text on the left or right of the toggle. We position it absolutely so it stays fixed on the left and right ends, depending on the toggle’s state.


3. ToggleCircle: This is the circular element that moves from left to right. It starts on the left when inactive and moves to the right when active. The transition effect provides smooth movement.


4. State Management: We use a useState hook to manage the toggle’s state. The state determines the position of the ToggleCircle and which text is active.


5. toggle function: This function toggles the isActive state between true and false, switching the position of the circle and the displayed text.



CSS Styling Notes

left: 'calc(100% - 34px)' is calculated based on the toggle width and padding to ensure the circle moves to the exact position on the right.

transition: 'left 0.3s ease' creates a smooth animation when toggling.


Usage

You can now use this ToggleButton component anywhere in your application.

import React from 'react';
import ToggleButton from './ToggleButton';

function App() {
  return (
    <div>
      <h1>Custom Toggle Button</h1>
      <ToggleButton />
    </div>
  );
}

export default App;

This component provides a clean, simple toggle button where a user can switch between "Placeholder" and "All Days" views, with a smooth transition and clear design. Adjust the colors, width, or text as desired to match your application's theme.

