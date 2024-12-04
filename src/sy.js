jiimport React, { useState, useEffect } from 'react';
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



import React, { useRef } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Button } from "primereact/button";
import { Box, ChakraProvider } from "@chakra-ui/react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const GroupedBarChart = () => {
  const chartRef = useRef(null);

  // Data for the chart
  const data = {
    labels: ["Silence Time", "Customer Time", "Agent Time", "Other(Hold/Noise/Secure Pause)", "Queue Wait Time", "IVR Time"],
    datasets: [
      {
        label: "WS Plan with Ease",
        data: [13, 16, 26, 9, 10, 10],
        backgroundColor: "yellow",
        borderColor: "yellow",
        borderWidth: 1,
      },
      {
        label: "WS Corporate Market Launch",
        data: [12, 22, 32, 9, 10, 30],
        backgroundColor: "orange",
        borderColor: "orange",
        borderWidth: 1,
      },
      {
        label: "WS DCPCOM Test Client",
        data: [23, 2, 6, 19, 1, 55],
        backgroundColor: "orangered",
        borderColor: "orangered",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y", // Horizontal bar chart
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Percentage (%)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Categories",
        },
      },
    },
  };

  // Reset Zoom Functionality
  const handleResetZoom = () => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      chartInstance.resetZoom();
    }
  };

  return (
    <ChakraProvider>
      <Box p={5}>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <Bar data={data} options={options} ref={chartRef} />
          <Button
            label="Reset Zoom"
            onClick={handleResetZoom}
            className="p-button-outlined p-button-secondary mt-3"
          />
        </div>
      </Box>
    </ChakraProvider>
  );
};

export default GroupedBarChart;

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

.chart-container {
  margin: 20px auto;
  width: 80%;
  text-align: center;
}

.p-button-secondary {
  background-color: #f46b42; /* Orangered */
  border-color: #f46b42;
  color: white;
}

.p-button-secondary:hover {
  background-color: #d9534f; /* Darker shade */
  border-color: #d9534f;
}

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

// Sample data with more than 5 conversation IDs
const data = [
  { conversationId: "001", silence: 20, customerTalk: 30, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "002", silence: 15, customerTalk: 35, agentTalk: 30, IVR: 5, queueWait: 10, other: 5 },
  { conversationId: "003", silence: 10, customerTalk: 40, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "004", silence: 25, customerTalk: 25, agentTalk: 20, IVR: 15, queueWait: 10, other: 5 },
  { conversationId: "005", silence: 30, customerTalk: 20, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "006", silence: 10, customerTalk: 40, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "007", silence: 15, customerTalk: 35, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "008", silence: 20, customerTalk: 30, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "009", silence: 10, customerTalk: 35, agentTalk: 30, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "010", silence: 15, customerTalk: 40, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
  { conversationId: "011", silence: 25, customerTalk: 30, agentTalk: 20, IVR: 15, queueWait: 10, other: 5 },
  { conversationId: "012", silence: 20, customerTalk: 30, agentTalk: 25, IVR: 10, queueWait: 10, other: 5 },
];

const StackedBarChart = () => {
  return (
    <div style={{ width: "100%", height: "400px", overflowY: "scroll" }}>
      {/* The scroll container wraps the ResponsiveContainer */}
      <div style={{ height: "100%", overflowY: "scroll" }}>
        <BarChart
          width={600}  // Fixed width
          height={300} // Fixed height for the visible area
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="conversationId" />
          <Tooltip />
          <Legend />
          <Bar dataKey="silence" stackId="a" fill="#8884d8" name="Silence Time" barSize={12} />
          <Bar dataKey="customerTalk" stackId="a" fill="#82ca9d" name="Customer Talk Time" barSize={12} />
          <Bar dataKey="agentTalk" stackId="a" fill="#ffc658" name="Agent Talk Time" barSize={12} />
          <Bar dataKey="IVR" stackId="a" fill="#ff8042" name="IVR Time" barSize={12} />
          <Bar dataKey="queueWait" stackId="a" fill="#8dd1e1" name="Queue Wait Time" barSize={12} />
          <Bar dataKey="other" stackId="a" fill="#a4de6c" name="Other Time" barSize={12} />
        </BarChart>
      </div>
    </div>
  );
};

export default StackedBarChart;
