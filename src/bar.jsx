import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Typography } from '@mui/material';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const FeedbackBarChart = () => {
    const chartRef = useRef(null);

    // Sample data with more dates
    const data = {
        labels: [
            '2024-08-20', '2024-08-21', '2024-08-22', '2024-08-23',
            '2024-08-24', '2024-08-25', '2024-08-26', '2024-08-27',
            '2024-08-28', '2024-08-29', '2024-08-30', '2024-08-31'
        ],
        datasets: [
            {
                label: 'Negative Feedback',
                data: [20, 35, 25, 45, 30, 50, 28, 38, 27, 34, 31, 43],
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(50, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(255, 0, 0, 1)'); // Vibrant Red
                    gradient.addColorStop(1, 'rgba(255, 69, 0, 0.8)'); // Slightly lighter red
                    return gradient;
                },
                borderColor: 'rgba(139, 0, 0, 1)',
                borderWidth: 1,
            },
            {
                label: 'Positive Feedback',
                data: [30, 50, 40, 60, 45, 55, 35, 50, 40, 58, 60, 70],
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(0, 255, 0, 1)'); // Vibrant Green
                    gradient.addColorStop(1, 'rgba(34, 139, 34, 0.8)'); // Slightly darker green
                    return gradient;
                },
                borderColor: 'rgba(0, 100, 0, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'x', // Vertical bars
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(200, 200, 200, 0.3)', // Light grey grid lines
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: 'Proxima Nova, Optima, Arial, sans-serif',
                    },
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: 'Proxima Nova, Optima, Arial, sans-serif',
                },
                bodyFont: {
                    family: 'Proxima Nova, Optima, Arial, sans-serif',
                },
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x',
                },
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 10, // Decreased bottom padding
                left: 20,
            },
        },
        barPercentage: 0.7, // Control bar width, decreased for less gap
        categoryPercentage: 0.7, // Control category width for grouping, decreased for less gap
    };

    // Function to reset zoom
    const resetZoom = () => {
        chartRef.current.resetZoom();
    };

    return (
        <Card
            style={{
                width: '80vw',
                margin: '20px auto',
                padding: '20px',
                textAlign: 'left',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                style={{
                    fontFamily: 'Proxima Nova, Optima, Arial, sans-serif',
                    marginBottom: '10px',
                    color: '#003366', // Dark navy blue for the title
                }}
            >
                Feedback Bar Chart
            </Typography>
            <Typography
                variant="subtitle2"
                gutterBottom
                style={{
                    fontFamily: 'Proxima Nova, Optima, Arial, sans-serif',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '10px', // Reduced margin bottom to utilize more space
                }}
            >
                Feedback Data from 2024-08-20 to 2024-08-31
            </Typography>
            <Button
                label="Reset Zoom"
                icon="pi pi-search-minus"
                onClick={resetZoom}
                style={{
                    marginBottom: '10px',
                    display: 'block',
                    border: '1px solid #ccc', // Border for the button
                    borderRadius: '4px',
                    padding: '6px 12px', // Added padding to separate border from text
                }}
            />
            <div style={{ height: '60vh' }}>
                <Bar ref={chartRef} data={data} options={options} />
            </div>
        </Card>
    );
};

export default FeedbackBarChart;
