const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const { format, parseISO, startOfWeek, endOfWeek } = require('date-fns');

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8012
//Set Oracle DB connection settings
const dbConfig = {
  user: 'GEN_IXNDB',
  password: 'Knu54h#I4dmE6P9a',
  connectString: 'ctip.apptoapp.org:1521/ctip_Srvc.oracle.db',
};

app.post('/bot-feedback', async (req, res) => {
  const orgFormatter = 'yyyy-MM-dd';
  const targetFormatter = 'yyyy-MM-dd';
  console.log(req.body);
  
  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;
  let flob = req.query.flob || 'all';
  console.log("Date Range ", fromDate,toDate);
  
  let firstLoad = false;
  let connection;

  try {
    // If fromDate and toDate are not provided, set them to the current week
    if ((!fromDate || fromDate === '') && (!toDate || toDate === '')) {
      const today = new Date();
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 }); // assuming week starts on Sunday
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });

      fromDate = format(startOfWeekDate, targetFormatter);
      toDate = format(endOfWeekDate, targetFormatter);
      firstLoad = true;
    } else {
      // If dates are provided, parse them to the target format
      fromDate = format(parseISO(fromDate), targetFormatter);
      toDate = format(parseISO(toDate), targetFormatter);
    }

    // Ensure flob is in the correct format
    const validFlobs = ['WS', 'EB', 'BF', 'HO', 'EBRC'];
    flob = validFlobs.includes(flob) ? flob : 'WS';

    // Establish a connection to the Oracle database
    connection = await oracledb.getConnection(dbConfig);

    let negativeFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments != 'positive'
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')
    `;

    let positiveFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments = 'positive'
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')
    `;

    // if (flob !== 'all') {
    //   negativeFeedbackQuery += ` AND LOB = :flob`;
    //   positiveFeedbackQuery += ` AND LOB = :flob`;
    // }

    negativeFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    positiveFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    console.log(positiveFeedbackQuery);
    
    // Execute negative feedback query
    const negativeFeedbackResults = await connection.execute(negativeFeedbackQuery, {
      fromDate,
      toDate
    });

    const positiveFeedbackResults = await connection.execute(positiveFeedbackQuery, {
      fromDate,
      toDate
    });
    console.log(positiveFeedbackResults);
    
    const negativeFeedback = {};
    const positiveFeedback = {};

    // Process negative feedback results
    negativeFeedbackResults.rows.forEach(result => {
      negativeFeedback[result[0].toISOString().split('T')[0]] = result[1];
    });

    // Process positive feedback results
    positiveFeedbackResults.rows.forEach(result => {
      positiveFeedback[result[0].toISOString().split('T')[0]] = result[1];
    });

    // Ensure both datasets have the same keys
    for (let date in negativeFeedback) {
      if (!positiveFeedback.hasOwnProperty(date)) {
        positiveFeedback[date] = 0;
      }
    }

    for (let date in positiveFeedback) {
      if (!negativeFeedback.hasOwnProperty(date)) {
        negativeFeedback[date] = 0;
      }
    }

    const sortedNegativeFeedback = Object.fromEntries(Object.entries(negativeFeedback).sort());
    const sortedPositiveFeedback = Object.fromEntries(Object.entries(positiveFeedback).sort());

    res.json({
      negativedataset: sortedNegativeFeedback,
      positivedataset: sortedPositiveFeedback,
      FeedSuccess: 'True',
    });

  } catch (error) {
    console.error(error);
    if (connection) {
      await connection.close();
    }
    res.json({ FeedFail: 'True' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
})
app.get("/",(req,res)=>{
  res.send("Hello World")
})
app.listen(port, () => {
  console.log( `Server is running on port ${port}`);
});
////////////////////////////////////////



import React, { useState,useEffect} from "react";
import { useSelector } from 'react-redux';
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
import { Delete as DeleteIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import { getBotFeedback } from './API/TopicAPI';

const mockCategories = ["Positive Feedback", "Negative Feedback"];

const mockData = {
  "Positive Feedback": {
    value: "68K",
    trend: "up",
    color: "#00FF00",
    data: [2030, 615, 870, 560, 100, 1200, 3550],
  },
  Interactions: {
    value: "80K",
    trend: "upo",
    color: "#797979",
    data: [200, 180, 170, 155, 140, 160, 150],
  },
  "Negative Feedback": {
    value: "12K",
    trend: "down",
    color: "#991350",
    data: [42, 21, 20, 83, 19, 18, 20],
  },
  "PFR": {
    value: "85%",
    trend: "pfr",
    color: "#797979",
    data: [50, 72, 147, 52, 35, 60, 100],
  },
  "NFR": {
    value: "15%",
    trend: "nfr",
    color: "#797979",
    data: [434, 252, 247, 342, 235, 240, 100],
  }
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


  const fetchedCurrentDate = useSelector(state => state.fetchCurrentDate);
  
  const fetchedDateRange = useSelector(state => state.dateRange)
  console.log("Hi",fetchedDateRange);
  const [cards, setCards] = useState([
    { category: "Interactions", isRemovable: false },
    { category: "Positive Feedback", isRemovable: false },
    { category: "Negative Feedback", isRemovable: false },
    { category: "PFR", isRemovable: false },
    { category: "NFR", isRemovable: false },
  ]);

  const trendValues = { upo: "-18%", up: "+35%", down: "-15%", neutral: "+5%" ,pfr:"+7%", nfr:"-4%"};

  useEffect(()=>{
   
    const fetchData = async()=>{
      try{
        console.log("Hi",fetchedDateRange.startDate);
        const response =await getBotFeedback({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
        });
        console.log(response);
        
      }catch(e){
        console.log("There was an error while getting Feedback Data",e);
        
      }
    }
    fetchData();
  })
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
          maxWidth: "60%",
          margin: "0px auto 30px",
        }}
      >
        <Grid container spacing={2} justifyContent="center" sx={{minWidth:"900px"}}>
          {cards.map((card, index) => {
            const trend = mockData[card.category].trend;

            // Custom chart color based on trend
            const chartColor =
              trend === "up"
                ? "#00FF00" // Green for positive trend
                : trend === "down"
                ? "#991350" // Custom color for negative trend
                : "#999999"; // Default color for neutral

            return (
              <Grid
                item
                xs={2}
                sm={2}
                md={2.4}
                lg={2.4}
                xl={2.4}
                key={index}
                //sx={{ minWidth: '120px' }}
                gap={1}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card variant="elevation" sx={{ height: "100%", pb: "0px" }}>
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
                          fontSize: "1rem",
                          color: "white",
                          fontFamily: "Optima, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        {card.category}
                      </Typography>
                      {card.isRemovable && (
                        <IconButton
                          onClick={() => setCards(cards.filter((_, i) => i !== index))}
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
                                color: mockData[card.category].color,
                              }}
                            >
                              {mockData[card.category].value}
                            </Typography>
                            <Tooltip
                              title={
                                trendValues[trend] + " increase in last 7 days"
                              }
                            >
                              <Chip
                                size="small"
                                color={
                                  trend === "up"
                                    ? "success"
                                    : trend === "down"
                                    ? "error"
                                    : "default"
                                }
                                sx={{ fontSize: ".9rem" }}
                                label={trendValues[trend]}
                              />
                            </Tooltip>
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontSize: ".9rem" }}
                          >
                            Last 7 Days
                          </Typography>
                        </Stack>
                        <Box sx={{ width: "100%", height: 70, padding: "0px" }}>
                          <SparkLineChart
                            colors={[chartColor]} // Custom color for chart line
                            data={mockData[card.category].data}
                            area
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
};

export default CategoriesReporting;

