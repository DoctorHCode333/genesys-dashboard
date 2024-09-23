const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  subDays,
} = require("date-fns");

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8012;
//Set Oracle DB connection settings
const dbConfig = {
  user: "GEN_IXNDB",
  password: "Knu54h#I4dmE6P9a",
  connectString: "ctip.apptoapp.org:1521/ctip_Srvc.oracle.db",
};

app.post("/bot-feedback", async (req, res) => {
  const orgFormatter = "yyyy-MM-dd";
  const targetFormatter = "yyyy-MM-dd";

  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;
  let flob = req.query.flob || "all";
  console.log("Date Range ", fromDate, toDate);

  let firstLoad = false;
  let connection;

  try {
    // If fromDate and toDate are not provided, set them to the current week
    if ((!fromDate || fromDate === "") && (!toDate || toDate === "")) {
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
    const validFlobs = ["WS", "EB", "BF", "HO", "EBRC"];
    flob = validFlobs.includes(flob) ? flob : "WS";

    // Establish a connection to the Oracle database
    connection = await oracledb.getConnection(dbConfig);

    let interactionsQuery = `
    SELECT TRUNC(startdate), COUNT(conversationid)
    FROM botfeedback
    AND TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
    AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')
  `;

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

    interactionsQuery += " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate);";
    negativeFeedbackQuery += " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate);";
    positiveFeedbackQuery += " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate);";

    // Execute negative feedback query
    const interactionsResults = await connection.execute(interactionsQuery, {
      fromDate,
      toDate,
    });

    const negativeFeedbackResults = await connection.execute(
      negativeFeedbackQuery,
      {
        fromDate,
        toDate,
      }
    );

    const positiveFeedbackResults = await connection.execute(
      positiveFeedbackQuery,
      {
        fromDate,
        toDate,
      }
    );

    console.log(positiveFeedbackResults);

    const negativeFeedback = {};
    const positiveFeedback = {};

    // Process negative feedback results
    negativeFeedbackResults.rows.forEach((result) => {
      negativeFeedback[result[0].toISOString().split("T")[0]] = result[1];
    });

    // Process positive feedback results
    positiveFeedbackResults.rows.forEach((result) => {
      positiveFeedback[result[0].toISOString().split("T")[0]] = result[1];
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

    const sortedNegativeFeedback = Object.fromEntries(
      Object.entries(negativeFeedback).sort()
    );
    const sortedPositiveFeedback = Object.fromEntries(
      Object.entries(positiveFeedback).sort()
    );

    res.json({
      interactions: interactions,
      negativedataset: sortedNegativeFeedback,
      positivedataset: sortedPositiveFeedback,
      FeedSuccess: "True",
    });
  } catch (error) {
    console.error(error);
    if (connection) {
      await connection.close();
    }
    res.json({ FeedFail: "True" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.post("/bot-feedback-trend", async (req, res) => {
  const targetFormatter = "yyyy-MM-dd";
  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;

  let flob = req.query.flob || "all";
  let connection;

  try {
    // Format and validate input date
    fromDate = format(parseISO(fromDate), targetFormatter);
    toDate = format(parseISO(toDate), targetFormatter);
    const previousFromDate = format(
      subDays(parseISO(fromDate), 7),
      targetFormatter
    );
    const previousToDate = format(
      subDays(parseISO(fromDate), 1),
      targetFormatter
    );

    connection = await oracledb.getConnection(dbConfig);
    console.log("Inside bot-feedback-trend");
    // Fetch total data for current and previous periods
    const fetchTotalsQuery = `SELECT COUNT(conversationid) AS interactions,SUM(CASE WHEN comments = 'positive' THEN 1 ELSE 0 END) AS positive,SUM(CASE WHEN comments = 'negative' THEN 1 ELSE 0 END) AS negative FROM botfeedback WHERE TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD');`;
    console.log("2Inside bot-feedback-trend");
    const currentTotals = await connection.execute(fetchTotalsQuery, {
      fromDate,
      toDate,
    });
    const previousTotals = await connection.execute(fetchTotalsQuery, {
      fromDate: previousFromDate,
      toDate: previousToDate,
    });
    console.log("3Inside bot-feedback-trend");
    const processTotals = (data) => ({
      interactions: data.rows[0][0],
      positive: data.rows[0][1],
      negative: data.rows[0][2],
    });

    const calcPercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const current = processTotals(currentTotals);
    const previous = processTotals(previousTotals);

    // Calculate percentage changes
    const percentChanges = {
      interactions: calcPercentageChange(
        current.interactions,
        previous.interactions
      ),
      positive: calcPercentageChange(current.positive, previous.positive),
      negative: calcPercentageChange(current.negative, previous.negative),
    };
    console.log({
      currentPeriod: current,
      percentChanges,
      FeedSuccess: "True",
    });

    res.json({
      currentPeriod: current,
      percentChanges,
      FeedSuccess: "True",
    });
  } catch (error) {
    console.error(error);
    res.json({ FeedFail: "True" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

////////////////////////////////////////


import React, { useState, useEffect } from "react";
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
import { getBotFeedback, getBotFeedbackTrend } from './API/TopicAPI';

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
  const fetchedDateRange = useSelector(state => state.dateRange);

  const [cards, setCards] = useState([
    { category: "Interactions", isRemovable: false },
    { category: "Positive Feedback", isRemovable: false },
    { category: "Negative Feedback", isRemovable: false },
  ]);

  const [trendData, setTrendData] = useState(null);
  const [granularData, setGranularData] = useState(null);

  useEffect(() => {
    // Fetch trend data
    const fetchTrendData = async () => {
      try {
        const response = await getBotFeedbackTrend({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
        });
        setTrendData(response);
      } catch (e) {
        console.error("Error fetching trend data", e);
      }
    };

    // Fetch granular data for Sparkline
    const fetchGranularData = async () => {
      try {
        const response = await getBotFeedback({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
        });
        setGranularData(response);
      } catch (e) {
        console.error("Error fetching granular data", e);
      }
    };

    fetchTrendData();
    fetchGranularData();
  }, [fetchedDateRange]);

  if (!trendData || !granularData) {
    return <div>Loading...</div>;
  }

  const { currentPeriod, percentChanges } = trendData;
  const { dailyData } = granularData;

  const cardData = {
    "Interactions": {
      value: currentPeriod.interactions,
      trend: percentChanges.interactions,
      data: dailyData.Interactions,
    },
    "Positive Feedback": {
      value: currentPeriod.positive,
      trend: percentChanges.positive,
      data: dailyData["Positive Feedback"],
    },
    "Negative Feedback": {
      value: currentPeriod.negative,
      trend: percentChanges.negative,
      data: dailyData["Negative Feedback"],
    }
  };

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
        <Grid container spacing={2} justifyContent="center" sx={{ minWidth: "900px" }}>
          {cards.map((card, index) => {
            const trend = cardData[card.category].trend > 0 ? "up" : "down";
            const chartColor = trend === "up" ? "#00FF00" : "#991350"; // Green for positive, Purple for negative

            return (
              <Grid item xs={2} sm={2} md={2.4} lg={2.4} xl={2.4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card variant="elevation" sx={{ height: "100%", pb: "0px" }}>
                    <Box
                      sx={{
                        background: "linear-gradient(to right, #FF4B00, #FF8000)",
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
                        <IconButton onClick={() => setCards(cards.filter((_, i) => i !== index))} sx={{ color: "#002B5B" }}>
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
                      <Stack direction="column" sx={{ justifyContent: "space-between", gap: 1, padding: "0px" }}>
                        <Stack sx={{ justifyContent: "space-between", padding: "5px 5px 0px" }}>
                          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Typography
                              variant="h6"
                              component="p"
                              sx={{
                                fontSize: ".9rem",
                                color: trend === "up" ? "#00FF00" : "#991350", // Green for up, Purple for down
                              }}
                            >
                              {cardData[card.category].value}
                            </Typography>
                            <Tooltip title={`There was a ${Math.abs(cardData[card.category].trend).toFixed(2)}% ${trend === "up" ? "increase" : "decrease"} in the last 7 days`}>
                              <Chip
                                size="small"
                                color={trend === "up" ? "success" : "error"}
                                sx={{ fontSize: ".9rem" }}
                                label={`${trend === "up" ? "+" : ""}${cardData[card.category].trend.toFixed(2)}%`}
                              />
                            </Tooltip>
                          </Stack>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: ".9rem" }}>
                            Last 7 Days
                          </Typography>
                        </Stack>
                        
                        {/* Sparkline chart */}
                        <Box sx={{ width: "100%", height: 70, padding: "0px" }}>
                          <SparkLineChart
                            colors={[chartColor]} // Custom color for chart line
                            data={cardData[card.category].data}
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


