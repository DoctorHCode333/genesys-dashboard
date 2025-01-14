import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  ['Page A', 4000, 2400, 2400, 100, 200, 300, 400, 500],
  ['Page B', 3000, 1398, 2210, 150, 250, 350, 450, 550],
  // More data
];

const MyBarChart = () => (
  <BarChart
    width={600}
    height={300}
    data={data.map((d) => ({
      name: d[0],
      uv: d[1],
      pv: d[2],
      amt: d[3],
      other1: d[4],
      other2: d[5],
      other3: d[6],
      other4: d[7],
      other5: d[8],
    }))}
  >
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const dataArray = payload[0].payload;
          const kvpArray = [
            ['Label', label],
            ['UV', dataArray.uv],
            ['PV', dataArray.pv],
            ['AMT', dataArray.amt],
            ['Other1', dataArray.other1],
            ['Other2', dataArray.other2],
            ['Other3', dataArray.other3],
            ['Other4', dataArray.other4],
            ['Other5', dataArray.other5],
          ];

          const leftKVPs = kvpArray.slice(0, 5);
          const rightKVPs = kvpArray.slice(5);

          return (
            <div className="custom-tooltip" style={tooltipStyle}>
              <div style={columnStyle}>
                {leftKVPs.map(([key, value], index) => (
                  <p key={index} style={kvpStyle}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
              </div>
              <div style={columnStyle}>
                {rightKVPs.map(([key, value], index) => (
                  <p key={index} style={kvpStyle}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
              </div>
            </div>
          );
        }
        return null;
      }}
    />
    <Bar dataKey="uv" fill="#8884d8" />
    <Bar dataKey="pv" fill="#82ca9d" />
  </BarChart>
);

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  display: 'flex',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  animation: 'fadeIn 0.3s ease-in-out',
};

const columnStyle = {
  marginRight: '20px',
};

const kvpStyle = {
  margin: 0,
  fontSize: '14px',
};

export default MyBarChart;
