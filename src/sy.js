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

// Styled components for the date carousel
const DateCarousel = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
}));

const DateDisplay = styled(Box)({
  width: '120px',
  textAlign: 'center',
  fontSize: '1.1rem',
  fontWeight: 500,
});

const VirtualizedStackedChart = () => {
  // Generate sample dates for the carousel
  const generateDates = () => {
    const dates = [];
    const startDate = new Date('2024-01-01');
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  // Sample data with 7 categories per group
  const generateData = () => {
    return Array.from({ length: 1000 }, (_, index) => ({
      name: `Group ${index + 1}`,
      cat1: Math.random() * 100,
      cat2: Math.random() * 100,
      cat3: Math.random() * 100,
      cat4: Math.random() * 100,
      cat5: Math.random() * 100,
      cat6: Math.random() * 100,
      cat7: Math.random() * 100,
    }));
  };

  const [data, setData] = useState(generateData());
  const [visibleData, setVisibleData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dateIndex, setDateIndex] = useState(0);
  const containerRef = useRef(null);
  
  const dates = generateDates();
  const ITEMS_PER_PAGE = 10;
  const RECORDS_PER_SET = 100;
  const BAR_HEIGHT = 30;
  const TOTAL_PAGES = Math.ceil(data.length / RECORDS_PER_SET);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
    '#0088fe', '#ff5252', '#8e44ad'
  ];

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const startIndex = (newPage - 1) * RECORDS_PER_SET;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setVisibleData(data.slice(startIndex, endIndex));
    // Reset scroll position
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  // Handle date navigation
  const handleDateChange = (direction) => {
    if (direction === 'next' && dateIndex < dates.length - 1) {
      setDateIndex(prev => prev + 1);
    } else if (direction === 'prev' && dateIndex > 0) {
      setDateIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    setVisibleData(data.slice(0, ITEMS_PER_PAGE));
  }, [data]);

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
      }, 500);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 1200, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Horizontal Stacked Bar Chart
        </Typography>

        {/* Date Selector Carousel */}
        <DateCarousel elevation={3}>
          <IconButton 
            onClick={() => handleDateChange('prev')}
            disabled={dateIndex === 0}
          >
            <ChevronLeft />
          </IconButton>
          <DateDisplay>
            {dates[dateIndex]}
          </DateDisplay>
          <IconButton 
            onClick={() => handleDateChange('next')}
            disabled={dateIndex === dates.length - 1}
          >
            <ChevronRight />
          </IconButton>
        </DateCarousel>

        {/* Legend Section */}
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

        {/* Scrollable Chart Container */}
        <Box
          ref={containerRef}
          sx={{
            height: 500,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
          pt: 2,
          borderTop: '1px solid #eee',
          mt: 2
        }}>
          <Pagination 
            count={TOTAL_PAGES}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualizedStackedChart;
