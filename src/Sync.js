SELECT *
FROM (
    SELECT your_columns,  -- replace with actual column names
           timestamp_column,
           ROW_NUMBER() OVER (PARTITION BY TRUNC(timestamp_column) ORDER BY timestamp_column DESC) AS rn
    FROM your_table
)
WHERE rn = 1;

import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Pagination,
  IconButton,
  Paper,
  styled
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components for date selector
const DateCarouselContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(145deg, #ffffff 0%, #f4f4f4 100%)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  height: '80px',
}));

const DateControl = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  width: '100%',
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  background: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    background: '#f8f8f8',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

const MotionDateDisplay = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  position: 'relative',
});

const VirtualizedBarChart = () => {
  const [data, setData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dateIndex, setDateIndex] = useState(0);
  const [dateDirection, setDateDirection] = useState(0);
  const containerRef = useRef(null);
  
  const ITEMS_PER_PAGE = 10;
  const RECORDS_PER_SET = 100;
  const BAR_HEIGHT = 30;
  const BAR_COLOR = '#2196f3'; // Single color for all bars

  // Generate sample dates
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date('2024-01-01');
    date.setDate(date.getDate() + i);
    return {
      full: date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      day: date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      })
    };
  });

  // Generate sample data with single value per item
  useEffect(() => {
    const generatedData = Array.from({ length: 1000 }, (_, index) => ({
      name: `Item ${index + 1}`,
      value: Math.random() * 100 + 20, // Random value between 20 and 120
    }));
    setData(generatedData);
    setVisibleData(generatedData.slice(0, ITEMS_PER_PAGE));
  }, []);

  // Handle date navigation
  const handleDateChange = (direction) => {
    if (direction === 'next' && dateIndex < dates.length - 1) {
      setDateDirection(1);
      setDateIndex(prev => prev + 1);
    } else if (direction === 'prev' && dateIndex > 0) {
      setDateDirection(-1);
      setDateIndex(prev => prev - 1);
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const startIndex = (newPage - 1) * RECORDS_PER_SET;
    setVisibleData(data.slice(startIndex, Math.min(startIndex + ITEMS_PER_PAGE, startIndex + RECORDS_PER_SET)));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  // Handle scroll and virtual loading
  const handleScroll = () => {
    if (!containerRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage > 80) {
      setLoading(true);
      setTimeout(() => {
        const currentPageStart = (page - 1) * RECORDS_PER_SET;
        const nextItemsIndex = visibleData.length + currentPageStart;
        const maxItemsForCurrentPage = Math.min(
          currentPageStart + RECORDS_PER_SET,
          data.length
        );

        if (nextItemsIndex < maxItemsForCurrentPage) {
          const newData = data.slice(
            currentPageStart,
            Math.min(nextItemsIndex + ITEMS_PER_PAGE, maxItemsForCurrentPage)
          );
          setVisibleData(newData);
        }
        setLoading(false);
      }, 300);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '12px 16px',
          }}
        >
          <Typography variant="subtitle2" color="textSecondary">
            {payload[0].payload.name}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {payload[0].value.toFixed(1)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 1200, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom sx={{ mb: 3 }}>
          Horizontal Bar Chart
        </Typography>

        {/* Date Selector */}
        <DateCarouselContainer elevation={3}>
          <DateControl>
            <StyledIconButton 
              onClick={() => handleDateChange('prev')}
              disabled={dateIndex === 0}
              size="large"
            >
              <ChevronLeft />
            </StyledIconButton>
            
            <AnimatePresence mode="wait">
              <MotionDateDisplay
                key={dateIndex}
                initial={{ 
                  x: dateDirection * 50,
                  opacity: 0,
                  scale: 0.8
                }}
                animate={{ 
                  x: 0,
                  opacity: 1,
                  scale: 1
                }}
                exit={{ 
                  x: dateDirection * -50,
                  opacity: 0,
                  scale: 0.8
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {dates[dateIndex].day}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {dates[dateIndex].full.split(',')[1]}
                </Typography>
              </MotionDateDisplay>
            </AnimatePresence>

            <StyledIconButton 
              onClick={() => handleDateChange('next')}
              disabled={dateIndex === dates.length - 1}
              size="large"
            >
              <ChevronRight />
            </StyledIconButton>
          </DateControl>
        </DateCarouselContainer>

        {/* Chart Container */}
        <Box
          ref={containerRef}
          sx={{
            height: 500,
            overflowY: 'auto',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#555',
              },
            },
          }}
          onScroll={handleScroll}
        >
          <BarChart
            width={800}
            height={Math.max(500, visibleData.length * BAR_HEIGHT)}
            data={visibleData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 'auto']} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={80} 
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill={BAR_COLOR}
              radius={[0, 4, 4, 0]} // Rounded corners on right side
              animationDuration={300}
            />
          </BarChart>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        {/* Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          pt: 3,
          borderTop: '1px solid #eee',
          mt: 2
        }}>
          <Pagination 
            count={Math.ceil(data.length / RECORDS_PER_SET)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualizedBarChart;
