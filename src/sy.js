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

import React, { useState, useEffect } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { useDispatch, useSelector } from "react-redux";
import { Delete as DeleteIcon } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import Slider from "@mui/material/Slider";
import { getBotFeedback, getBotFeedbackTrend } from "../API/TopicAPI";
import Loading from "./Loading";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

const CategoriesReporting = (props) => {
  const {
    trendData,
    dailyData,
    cardData,
    setCardData,
    interactionsTrendData,
    ACDTrendData,
    customerTrendData,
    agentTrendData,
    silenceTrendData,
    IVRTrendData,
    othersTrendData,
    overtalkTrendData,
    selectedACDTime,
    selectedCustomerTime,
    selectedAgentTime,
    selectedSilenceTime,
    selectedIVRTime,
    selectedOthersTime,
    selectedOvertalkCount,

    setSelectedACDTime,
    setSelectedCustomerTime,
    setSelectedAgentTime,
    setSelectedSilenceTime,
    setSelectedIVRTime,
    setSelectedOthersTime,
    setSelectedOvertalkCount,
    resetTime,
  } = props;
 
  const [tempValue, setTempValue] = useState([20, 50]);
  const [finalValue, setFinalValue] = useState([20, 50]);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(0);

  const [ACDTimeRange, setACDTimeRange] = useState([0, 100]);
  const [customerTimeRange, setCustomerTimeRange] = useState([0, 100]);
  const [agentTimeRange, setAgentTimeRange] = useState([0, 100]);
  const [silenceTimeRange, setSilenceTimeRange] = useState([0, 100]);
  const [IVRTimeRange, setIVRTimeRange] = useState([0, 100]);
  const [othersTimeRange, setOthersTimeRange] = useState([0, 100]);
  const [overtalkRange, setOvertalkRange] = useState([0, 500]);

  // const [selectedagentTime,setSelectedAgentTime]=useState([20, 50]);
  // const [selectedcustomerTime,setSelectedCustomerTime]=useState([20, 50]);
  // const [selectedQueueTime,setSelectedQueueTime]=useState([20, 50]);
  // const [selectedIVRTime,setSelectedIVRTime]=useState([20, 50]);
  // const [selectedothersTime,setSelectedOthersTime]=useState([20, 50]);
  // const [selectedovertalk,setSelectedOvertalk]=useState([20, 50]);

  const [cards, setCards] = useState([
    {
      category: "Total Interactions",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: false,
      hasReset: true,
    },
    {
      category: "Silence Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: silenceTimeRange,
      rangeSelect: setSilenceTimeRange,
      rangeConfirm: setSelectedSilenceTime,
    },
    {
      category: "Agent Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: agentTimeRange,
      rangeSelect: setAgentTimeRange,
      rangeConfirm: setSelectedAgentTime,
    },
    {
      category: "Customer Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: customerTimeRange,
      rangeSelect: setCustomerTimeRange,
      rangeConfirm: setSelectedCustomerTime,
    },
    {
      category: "Queue Wait Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: ACDTimeRange,
      rangeSelect: setACDTimeRange,
      rangeConfirm: setSelectedACDTime,
    },
    {
      category: "IVR Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: IVRTimeRange,
      rangeSelect: setIVRTimeRange,
      rangeConfirm: setSelectedIVRTime,
    },
    {
      category: "Others(Hold/Noise/SP)",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: othersTimeRange,
      rangeSelect: setOthersTimeRange,
      rangeConfirm: setSelectedOthersTime,
    },
    {
      category: "Overtalk Count",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: overtalkRange,
      rangeSelect: setOvertalkRange,
      rangeConfirm: setSelectedOvertalkCount,
    },
  ]);

  useEffect(() => {
    setACDTimeRange([selectedACDTime.from, selectedACDTime.to]);
  }, [selectedACDTime]);
  useEffect(() => {
    setCustomerTimeRange([selectedCustomerTime.from, selectedCustomerTime.to]);
  }, [selectedCustomerTime]);
  useEffect(() => {
    setAgentTimeRange([selectedAgentTime.from, selectedAgentTime.to]);
  }, [selectedAgentTime]);
  useEffect(() => {
    setSilenceTimeRange([selectedSilenceTime.from, selectedSilenceTime.to]);
  }, [selectedSilenceTime]);
  useEffect(() => {
    setIVRTimeRange([selectedIVRTime.from, selectedIVRTime.to]);
  }, [selectedIVRTime]);
  useEffect(() => {
    setOthersTimeRange([selectedOthersTime.from, selectedOthersTime.to]);
  }, [selectedOthersTime]);
  useEffect(() => {
    setOvertalkRange([selectedOvertalkCount.from, selectedOvertalkCount.to]);
  }, [selectedOvertalkCount]);
  // Update cardData only when trendData and dailyData are available
  useEffect(() => {
    //console.log(Object.keys(dailyData).length)
    if (
      Object.keys(interactionsTrendData).length !== 0 &&
      Object.keys(dailyData).length !== 0
    ) {
      console.log("Setting card data with trendData and dailyData",dailyData)
      setSilenceTimeRange([selectedSilenceTime.from, selectedSilenceTime.to]);
      ACDTrendData,
      customerTrendData,
      agentTrendData,
      silenceTrendData,
      IVRTrendData,
      othersTrendData,
      overtalkTrendData,
      setCardData({
        "Total Interactions": {
          value: interactionsTrendData.currentPeriod?.interactions || 0,
          trend: interactionsTrendData.percentChanges?.interactions || 0,
          data: interactionsTrendData.dailyData.interactions || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Queue Wait Time": {
          value: interactionsTrendData.currentPeriod?.ACDTrendData || 0,
          trend: interactionsTrendData.percentChanges?.ACDTrendData || 0,
          data: interactionsTrendData.dailyData.ACDTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Customer Talk Time": {
          value: interactionsTrendData.currentPeriod?.customerTrendData || 0,
          trend: interactionsTrendData.percentChanges?.customerTrendData || 0,
          data: interactionsTrendData.dailyData.customerTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Agent Talk Time": {
          value: interactionsTrendData.currentPeriod?.agentTrendData || 0,
          trend: interactionsTrendData.percentChanges?.agentTrendData || 0,
          data: interactionsTrendData.dailyData.agentTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Silence Time": {
          value: interactionsTrendData.currentPeriod?.silenceTrendData || 0,
          trend: interactionsTrendData.percentChanges?.silenceTrendData || 0,
          data: interactionsTrendData.dailyData.silenceTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "IVR Time": {
          value: interactionsTrendData?.currentPeriod?.IVRTrendData || 0,
          trend: interactionsTrendData?.percentChanges?.IVRTrendData || 0,
          data: interactionsTrendData.dailyData.IVRTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Others(Hold/Noise/SP)": {
          value: interactionsTrendData?.currentPeriod?.othersTrendData || 0,
          trend: interactionsTrendData?.percentChanges?.othersTrendData || 0,
          data: interactionsTrendData.dailyData.othersTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
        "Overtalk Count": {
          value: interactionsTrendData?.currentPeriod?.overtalkTrendData || 0,
          trend: interactionsTrendData?.percentChanges?.overtalkTrendData || 0,
          data: interactionsTrendData.dailyData.overtalkTrendData || [],
          daysInInterval: interactionsTrendData.timePeriod || [],
        },
      });
      //setLoading(false); // Data is loaded, update loading state
    }
  }, [trendData, dailyData]);

  // Log cardData updates
  useEffect(() => {
    // console.log(Object.keys(cardData).length)
    if (Object.keys(cardData).length !== 0) {
      // console.log("Updated card data:", cardData);
      // console.log("Updated card data:", dailyData);
      setPeriod(interactionsTrendData.timePeriod.length);
      setCards([
        {
          category: "Total Interactions",
          isRemovable: false,
          description: `This card shows total count of feedback (${interactionsTrendData.currentPeriod.interactions}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: false,
          hasReset: true,
        },
        {
          category: "Queue Wait Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${interactionsTrendData.currentPeriod.ACDTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: ACDTimeRange,
          rangeSelect: setACDTimeRange,
          rangeConfirm: setSelectedACDTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Customer Talk Time",
          isRemovable: false,
          description: `This card shows the % of total positive feedback with respect to negative feedback (${interactionsTrendData.currentPeriod.customerTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: customerTimeRange,
          rangeSelect: setCustomerTimeRange,
          rangeConfirm: setSelectedCustomerTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Agent Talk Time",
          isRemovable: false,
          description: `This card shows total count of negative feedback (${interactionsTrendData.currentPeriod.agentTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: agentTimeRange,
          rangeSelect: setAgentTimeRange,
          rangeConfirm: setSelectedAgentTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Silence Time",
          isRemovable: false,
          description: `This card shows total count of positive feedback (${interactionsTrendData.currentPeriod.silenceTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: silenceTimeRange,
          rangeSelect: setSilenceTimeRange,
          rangeConfirm: setSelectedSilenceTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "IVR Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${interactionsTrendData.currentPeriod.IVRTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: IVRTimeRange,
          rangeSelect: setIVRTimeRange,
          rangeConfirm: setSelectedIVRTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Others(Hold/Noise/SP)",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${interactionsTrendData.currentPeriod.othersTrendData}) for ${interactionsTrendData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: othersTimeRange,
          rangeSelect: setOthersTimeRange,
          rangeConfirm: setSelectedOthersTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Overtalk Count",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${interactionsTrendData.currentPeriod.overtalkTrendData}) for ${interactionsTrendData.timePeriod .length} days.`,
          hasRange: true,
          rangeValue: overtalkRange,
          rangeSelect: setOvertalkRange,
          rangeConfirm: setSelectedOvertalkCount,
          step: 10,
          min: 0,
          max: 500,
        },
      ]);
      setLoading(false);
    }
  }, [cardData]);

  const handleChange = (event, newValue, index) => {
    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i == index ? { ...card, rangeValue: newValue } : card
      )
    );
  };

  const handleConfirm = (index) => {
    cards.map((card)=>{card.hasRange?card.rangeConfirm({from: card.rangeValue[0],to: card.rangeValue[1],}):""});
  };

  const hadleReset = () => {
    setACDTimeRange([0, 100]);
    setCustomerTimeRange([0, 100]);
    setAgentTimeRange([0, 100]);
    setSilenceTimeRange([0, 100]);
    setIVRTimeRange([0, 100]);
    setOthersTimeRange([0, 100]);
    setOvertalkRange([0, 500]);

    resetTime({ from: 0, to: 100 });
  };
  if (loading) {
    return (
      <div>
        {" "}
        <Loading />
      </div>
    );
  } else {
    return (
      <div style={{ marginTop: "10px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "20vh",
            backgroundColor: "#004E70",
            padding: "0px",
            maxWidth: "95%",
            margin: "20px auto 30px",
          }}
        >
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ maxWidth: "110%" }}
          >
            {cards.map((card, index) => {
              const category = card.category;
              const trend =
                cardData[category].trend >= 0
                  ? category == "Total Interactions"
                    ? "up"
                    : "down"
                  : category == "Total Interactions"
                  ? "down"
                  : "up";
              const trendData = cardData[category].trend;
              const chartColor = trend === "up" ? "#00FF00" : "#991350"; // Green for positive, Purple for negative

              return (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={2.4}
                  lg={2.4}
                  xl={2.4}
                  key={index}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {card.hasRange ? (
                      <div
                        className="flex flex-row justify-center"
                        style={{ padding: "5px 2px 10px 13px" }}
                      >
                        <Slider
                          value={card.rangeValue}
                          onChange={(event, newValue) =>
                            handleChange(event, newValue, index)
                          }
                          valueLabelDisplay="auto"
                          defaultValue={0}
                          min={card.min}
                          step={card.step}
                          max={card.max}
                          style={{ marginRight: "13px" }}
                        />
                        <IconButton
                          sx={{ padding: 0, margin: "0 0 0 8px" }}
                          onClick={() => handleConfirm(index)}
                          size="small"
                        >
                          <CheckCircleOutlineIcon
                            sx={{
                              color: "#fff",
                              backgroudColour: "#000",
                              borderRadius: "50%",
                              fontSize: 20,
                            }}
                          />
                        </IconButton>
                      </div>
                    ) : (
                      ""
                    )}

                    <Card
                      variant="elevation"
                      sx={{ height: "100%", pb: "0px" }}
                    >
                      <Box
                        sx={{
                          background:
                            "linear-gradient(to right, #FF4B00, #FF8000)",
                          padding: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTopLeftRadius: "2px",
                          borderTopRightRadius: "2px",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            whiteSpace: "nowrap",
                            fontSize: "1rem",
                            color: "white",
                            fontFamily: "Optima, sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          {card.category}
                        </Typography>
                        <div className="flex flex-row justify-between">
                          {card.hasRange ? (
                            <IconButton
                              sx={{ padding: 0, margin: 0 }}
                              size="small"
                            >
                              <AccessTimeIcon
                                sx={{
                                  color: "#fff",
                                  backgroudColour: "#000",
                                  borderRadius: "50%",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          ) : (
                            ""
                          )}
                          {card.hasReset ? (
                            <IconButton
                              sx={{ padding: 0, margin: 0 }}
                              size="small"
                              onClick={hadleReset}
                            >
                              <RestartAltIcon
                                sx={{
                                  color: "#fff",
                                  backgroudColour: "#000",
                                  borderRadius: "50%",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          ) : (
                            ""
                          )}
                          <Tooltip title={card.description}>
                            <IconButton
                              sx={{ padding: 0, margin: "0 0 0 8px" }}
                              size="small"
                            >
                              <InfoIcon
                                sx={{
                                  color: "#fff",
                                  backgroudColour: "#000",
                                  borderRadius: "50%",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </div>

                        {card.isRemovable && (
                          <IconButton
                            onClick={() =>
                              setCards(cards.filter((_, i) => i !== index))
                            }
                            sx={{ color: "#002B5B" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>

                      <CardContent
                        sx={{
                          backgroundColor: "white",
                          padding: "0px !important",
                        }}
                      >
                        <Stack
                          direction="column"
                          sx={{
                            justifyContent: "space-between",
                            gap: 1,
                            padding: "0px",
                          }}
                        >
                          <Stack
                            sx={{
                              justifyContent: "space-between",
                              padding: "5px 5px 0px",
                            }}
                          >
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                  fontSize: ".9rem",
                                  color: trend === "up" ? "#00FF00" : "#991350",
                                }}
                              >
                                {`${cardData[card.category]?.value}${
                                  card.category === "PFR" ||
                                  card.category === "NFR"
                                    ? "%"
                                    : ""
                                }` || 0}
                              </Typography>
                              <Tooltip
                                title={`There was a net ${Math.abs(
                                  cardData[card.category]?.trend || 0
                                ).toFixed(2)}% ${
                                  trendData > 0 ? "increase" : "decrease"
                                } in ${
                                  card.category
                                } in comparision to preceding ${period} days.`}
                              >
                                <Chip
                                  size="small"
                                  color={trend === "up" ? "success" : "error"}
                                  sx={{ fontSize: ".9rem" }}
                                  label={`${trendData > 0 ? "+" : ""}${(
                                    cardData[card.category]?.trend || 0
                                  ).toFixed(2)}%`}
                                />
                              </Tooltip>
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: ".9rem",
                              }}
                            >
                              For {period} Days
                            </Typography>
                          </Stack>

                          {/* Sparkline chart */}
                          <Box
                            sx={{ width: "100%", height: 70, padding: "0px" }}
                          >
                            <SparkLineChart
                              colors={[chartColor]}
                              data={cardData[card.category]?.data || []}
                              area
                              showHighlight
                              showTooltip
                              xAxis={{

                                scaleType:'band',
                                data:cardData[card.category]?.daysInInterval || []
                              }}
                              sx={{
                                [`& .${areaElementClasses.root}`]: {
                                  fill: `url(#area-gradient-${card.category})`,
                                },
                              }}
                            >
                              <AreaGradient
                                color={chartColor}
                                id={`area-gradient-${card.category}`}
                              />
                            </SparkLineChart>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </div>
    );
  }
};

export default CategoriesReporting;
