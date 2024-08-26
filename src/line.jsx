import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,  // Added PointElement registration
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const FeedbackLineChart = () => {
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
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)'); // Dark red
                    gradient.addColorStop(1, 'rgba(255, 69, 0, 0.8)'); // Lighter red
                    return gradient;
                },
                backgroundColor: 'rgba(255, 69, 0, 0.2)', // Light red for fill
                borderWidth: 2,
                tension: 0.4, // Smooth line
                pointRadius: 5, // Add points to the line
                pointHoverRadius: 7, // Increase size of points on hover
            },
            {
                label: 'Positive Feedback',
                data: [30, 50, 40, 60, 45, 55, 35, 50, 40, 58, 60, 70],
                borderColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(0, 100, 0, 0.8)'); // Dark green
                    gradient.addColorStop(1, 'rgba(0, 255, 0, 0.8)'); // Lighter green
                    return gradient;
                },
                backgroundColor: 'rgba(0, 255, 0, 0.2)', // Light green for fill
                borderWidth: 2,
                tension: 0.4, // Smooth line
                pointRadius: 5, // Add points to the line
                pointHoverRadius: 7, // Increase size of points on hover
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Date',
                    color: '#333',
                    font: {
                        family: 'Proxima Nova, Optima, Arial, sans-serif',
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(200, 200, 200, 0.3)', // Light grey grid lines
                },
                title: {
                    display: true,
                    text: 'Count',
                    color: '#333',
                    font: {
                        family: 'Proxima Nova, Optima, Arial, sans-serif',
                    },
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
                Feedback Line Chart
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
                <Line ref={chartRef} data={data} options={options} />
            </div>
        </Card>
    );
};

export default FeedbackLineChart;
