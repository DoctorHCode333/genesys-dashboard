import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

// Styled components for enhanced date selector
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

const VirtualizedStackedChart = () => {
  const [data, setData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dateIndex, setDateIndex] = useState(0);
  const [dateDirection, setDateDirection] = useState(0); // -1 for left, 1 for right
  const containerRef = useRef(null);
  
  const ITEMS_PER_PAGE = 10;
  const RECORDS_PER_SET = 100;
  const BAR_HEIGHT = 30;

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

  // Generate sample data
  useEffect(() => {
    const generatedData = Array.from({ length: 1000 }, (_, index) => ({
      name: `Group ${index + 1}`,
      cat1: Math.random() * 100,
      cat2: Math.random() * 100,
      cat3: Math.random() * 100,
      cat4: Math.random() * 100,
      cat5: Math.random() * 100,
      cat6: Math.random() * 100,
      cat7: Math.random() * 100,
    }));
    setData(generatedData);
    setVisibleData(generatedData.slice(0, ITEMS_PER_PAGE));
  }, []);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
    '#0088fe', '#ff5252', '#8e44ad'
  ];

  // Handle date navigation with animation
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

  // Handle scroll and virtual loading within current page set
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

  return (
    <Card sx={{ width: '100%', maxWidth: 1200, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom sx={{ mb: 3 }}>
          Horizontal Stacked Bar Chart
        </Typography>

        {/* Enhanced Date Selector */}
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

        {/* Chart Legend */}
        <Box sx={{ mb: 2 }}>
          <BarChart
            width={800}
            height={50}
            data={[]}
            margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
          >
            <Legend 
              verticalAlign="top"
              align="center"
              payload={colors.map((color, index) => ({
                value: `Category ${index + 1}`,
                type: 'rect',
                color: color
              }))}
            />
          </BarChart>
        </Box>

        {/* Virtualized Chart Container */}
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
            <YAxis dataKey="name" type="category" width={80} interval={0} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '10px 14px',
              }}
            />
            {colors.map((color, index) => (
              <Bar 
                key={`cat${index + 1}`}
                dataKey={`cat${index + 1}`}
                stackId="a"
                fill={color}
                name={`Category ${index + 1}`}
              />
            ))}
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

export default VirtualizedStackedChart;
