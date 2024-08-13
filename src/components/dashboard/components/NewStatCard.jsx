import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, IconButton, Grid, Chip, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useTheme } from '@mui/material/styles';
import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { areaElementClasses } from '@mui/x-charts/LineChart';

const mockCategories = [
    'Sales', 'Revenue', 'Customer Satisfaction', 'Support Tickets', 
    'Website Traffic', 'Conversions', 'User Sign-ups', 'Churn Rate'
];

const mockData = {
    Sales: { value: 120, trend: 'up', color: '#00FF00', data: [230, 50, 65, 80, 60, 100, 120] }, // More fluctuations
    Revenue: { value: 150, trend: 'down', color: '#FF0000', data: [200, 180, 170, 155, 140, 160, 150] }, // More irregular decline
    'Customer Satisfaction': { value: 80, trend: 'up', color: '#00FF00', data: [170, 75, 60, 85, 70, 182, 90] }, // More ups and downs
    'Support Tickets': { value: 40, trend: 'down', color: '#FF0000', data: [50, 52, 147, 42, 35, 40, 138] }, // More variation with a general decline
    'Website Traffic': { value: 200, trend: 'up', color: '#00FF00', data: [50, 165, 180, 10, 510, 205, 220] }, // More dynamic upward trend
    'Conversions': { value: 90, trend: 'up', color: '#00FF00', data: [80, 75, 85, 190, 80, 92, 190] }, // Irregular increases
    'User Sign-ups': { value: 60, trend: 'up', color: '#00FF00', data: [50, 55, 60, 150, 65, 62, 70] }, // Fluctuating increases
    'Churn Rate': { value: 20, trend: 'down', color: '#FF0000', data: [42, 21, 20, 83, 19, 18, 20] }, // More noticeable fluctuations
};

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

const CategoriesReporting = () => {
    const theme = useTheme();
    const [cards, setCards] = useState([
        { category: 'Sales', isRemovable: false },
        { category: 'Revenue', isRemovable: true },
        { category: 'Customer Satisfaction', isRemovable: true },
    ]);
    const [selectedCategory, setSelectedCategory] = useState([]);

    const handleAddCard = () => {
        if (selectedCategory.length) {
            setCards([...cards, ...selectedCategory.map(category => ({ category, isRemovable: true }))]);
            setSelectedCategory([]); // Clear selection after adding
        }
    };

    const handleDeleteCard = (index) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    const availableCategories = mockCategories.filter(
        (category) => !cards.map((card) => card.category).includes(category)
    );

    const trendValues = { up: '+25%', down: '-25%', neutral: '+5%' };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#004E70', padding: 2 }}>
            <Grid container spacing={2} justifyContent="center">
                {cards.map((card, index) => {
                    const trend = mockData[card.category].trend;
                    const color = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default';
                    const chartColor = trend === 'up' ? theme.palette.success.main : theme.palette.error.main;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={index} sx={{ maxWidth: 250}}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <Box sx={{ background: 'linear-gradient(to right, #FF4B00, #FF8000)', padding: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                                        <Typography variant="h6" sx={{ color: 'white', fontFamily: 'Optima, sans-serif', fontWeight: 'bold' }}>
                                            {card.category}
                                        </Typography>
                                        {card.isRemovable && (
                                            <IconButton
                                                onClick={() => handleDeleteCard(index)}
                                                sx={{ color: '#002B5B' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <CardContent sx={{ backgroundColor: 'white', padding: 2 }}>
                                        <Stack
                                            direction="column"
                                            sx={{ justifyContent: 'space-between', gap: 1 }}
                                        >
                                            <Stack sx={{ justifyContent: 'space-between' }}>
                                                <Stack
                                                    direction="row"
                                                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <Typography variant="h4" component="p" sx={{ color: mockData[card.category].color }}>
                                                        {mockData[card.category].value}
                                                    </Typography>
                                                    <Chip size="small" color={color} label={trendValues[trend]} />
                                                </Stack>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Last 7 Days
                                                </Typography>
                                            </Stack>
                                            <Box sx={{ width: '100%', height: 50 }}>
                                                <SparkLineChart
                                                    colors={[chartColor]}
                                                    data={mockData[card.category].data}
                                                    area
                                                    sx={{
                                                        [`& .${areaElementClasses.root}`]: {
                                                            fill: `url(#area-gradient-${card.category})`,
                                                        },
                                                    }}
                                                >
                                                    <AreaGradient color={chartColor} id={`area-gradient-${card.category}`} />
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

            {/* Add Card Section */}
            {cards.length < 9 && (
                <Box sx={{ marginTop: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <MultiSelect
                            value={selectedCategory}
                            options={availableCategories.map(category => ({ label: category, value: category }))}
                            onChange={(e) => setSelectedCategory(e.value)}
                            placeholder="Select a category"
                            display="chip"
                            style={{ minWidth: '200px', backgroundColor: '#ffffff', borderRadius: '4px' }}
                            filter
                            filterPlaceholder="Search categories"
                        />
                        <Tooltip title={!selectedCategory.length ? "Select a category" : ""} placement="bottom">
                            <span>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddCard}
                                    disabled={!selectedCategory.length}
                                    sx={{ background: 'linear-gradient(to right, #FF4B00, #FF8000)', color: 'white', '&:hover': { background: 'linear-gradient(to right, #E64300, #FF6A00)' } }}
                                >
                                    Add Stat Card
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default CategoriesReporting;