import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VirtualizedStackedChart = () => {
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
  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  const BAR_HEIGHT = 30; // Fixed height for each bar

  // Color palette for the 7 categories
  const colors = [
    '#8884d8', // Purple
    '#82ca9d', // Green
    '#ffc658', // Yellow
    '#ff7300', // Orange
    '#0088fe', // Blue
    '#ff5252', // Red
    '#8e44ad'  // Deep Purple
  ];

  useEffect(() => {
    setVisibleData(data.slice(0, ITEMS_PER_PAGE));
  }, [data]);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage > 80) {
      const nextPage = page + 1;
      const newData = data.slice(0, (nextPage + 1) * ITEMS_PER_PAGE);
      
      if (newData.length > visibleData.length) {
        setVisibleData(newData);
        setPage(nextPage);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Horizontal Stacked Bar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend positioned above the scrollable area */}
        <div className="mb-4">
          <BarChart
            width={800}
            height={50}
            data={[]}
            margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
          >
            <Legend 
              verticalAlign="top"
              align="center"
              payload={[
                { value: 'Category 1', type: 'rect', color: colors[0] },
                { value: 'Category 2', type: 'rect', color: colors[1] },
                { value: 'Category 3', type: 'rect', color: colors[2] },
                { value: 'Category 4', type: 'rect', color: colors[3] },
                { value: 'Category 5', type: 'rect', color: colors[4] },
                { value: 'Category 6', type: 'rect', color: colors[5] },
                { value: 'Category 7', type: 'rect', color: colors[6] },
              ]}
            />
          </BarChart>
        </div>

        {/* Scrollable chart container */}
        <div 
          ref={containerRef}
          className="overflow-y-auto"
          style={{ height: '500px' }} // Fixed height container
          onScroll={handleScroll}
        >
          <BarChart
            width={800}
            height={Math.max(500, visibleData.length * BAR_HEIGHT)} // Ensure minimum height
            data={visibleData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number"
              domain={[0, 'auto']}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              width={80}
              interval={0} // Show all labels
            />
            <Tooltip />
            {/* Seven stacked bars */}
            <Bar dataKey="cat1" stackId="a" fill={colors[0]} name="Category 1" />
            <Bar dataKey="cat2" stackId="a" fill={colors[1]} name="Category 2" />
            <Bar dataKey="cat3" stackId="a" fill={colors[2]} name="Category 3" />
            <Bar dataKey="cat4" stackId="a" fill={colors[3]} name="Category 4" />
            <Bar dataKey="cat5" stackId="a" fill={colors[4]} name="Category 5" />
            <Bar dataKey="cat6" stackId="a" fill={colors[5]} name="Category 6" />
            <Bar dataKey="cat7" stackId="a" fill={colors[6]} name="Category 7" />
          </BarChart>
          {page * ITEMS_PER_PAGE < data.length - ITEMS_PER_PAGE && (
            <div className="text-center p-4 text-gray-500">
              Scroll to load more...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualizedStackedChart;
