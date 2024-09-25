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

app.post('/bot-feedback', async (req, res) => {
  const orgFormatter = 'yyyy-MM-dd';
  const targetFormatter = 'yyyy-MM-dd';
  
  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;
  let flob = req.query.flob || 'all';
  console.log("Date Range ", fromDate, toDate);
  
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

    let interactionsQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
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

    // Group by date to get daily counts
    interactionsQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    negativeFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    positiveFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    
    // Execute the queries
    const interactionsResults = await connection.execute(interactionsQuery, {
      fromDate,
      toDate
    });

    const negativeFeedbackResults = await connection.execute(negativeFeedbackQuery, {
      fromDate,
      toDate
    });

    const positiveFeedbackResults = await connection.execute(positiveFeedbackQuery, {
      fromDate,
      toDate
    });

    
    // Process interaction resultsdsd
    const interactions = [];
    interactionsResults.rows.forEach(result => {
      interactions[result[0].toISOString().split('T')[0]] = result[1];
    });

    // Process negative feedback resultsdd
    const negativeFeedback = [];
    negativeFeedbackResults.rows.forEach(result => {
      negativeFeedback[result[0].toISOString().split('T')[0]] = result[1];
    });

    // Process positive feedback results
    const positiveFeedback = [];
    positiveFeedbackResults.rows.forEach(result => {
      positiveFeedback[result[0].toISOString().split('T')[0]] = result[1];
    });

    // Ensure both datasets have the same keys
    const allDates = new Set([...Object.keys(negativeFeedback), ...Object.keys(positiveFeedback), ...Object.keys(interactions)]);

    allDates.forEach(date => {
      if (!negativeFeedback[date]) negativeFeedback[date] = 0;
      if (!positiveFeedback[date]) positiveFeedback[date] = 0;
      if (!interactions[date]) interactions[date] = 0;
    });
    //console.log("fgfg",interactions);
    
    const sortedInteractions = Object.fromEntries(Object.entries(interactions).sort());
    const sortedNegativeFeedback = Object.fromEntries(Object.entries(negativeFeedback).sort());
    const sortedPositiveFeedback = Object.fromEntries(Object.entries(positiveFeedback).sort());

    const responsePayload = {
      interactions: interactions, // Include the sorted interactions count
      negativedataset: negativeFeedback,
      positivedataset: sortedPositiveFeedback,
      FeedSuccess: 'True',
    };
    console.log(responsePayload);
    //gives correct result
    // {
    //   interactions: [
    //     '2024-09-17': 330,
    //     '2024-09-18': 270,
    //     '2024-09-19': 265,
    //     '2024-09-20': 266,
    //     '2024-09-21': 100,
    //     '2024-09-22': 91,
    //     '2024-09-23': 16
    //   ],
    //   negativedataset: [
    //     '2024-09-17': 108,
    //     '2024-09-18': 97,
    //     '2024-09-19': 95,
    //     '2024-09-20': 89,
    //     '2024-09-21': 35,
    //     '2024-09-22': 26,
    //     '2024-09-23': 3
    //   ],
    //   positivedataset: {
    //     '2024-09-17': 222,
    //     '2024-09-18': 173,
    //     '2024-09-19': 170,
    //     '2024-09-20': 177,
    //     '2024-09-21': 65,
    //     '2024-09-22': 65,
    //     '2024-09-23': 13
    //   },
    //   FeedSuccess: 'True'
    // }
    res.json(responsePayload);

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
import { useDispatch, useSelector } from "react-redux";
import { setTrendData, setDailyData, setCardData } from "../Redux/actions";
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
import { getBotFeedback, getBotFeedbackTrend } from "../API/TopicAPI";

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
//sample response cardData object for reference
// {
//   "Interactions": {
//       "value": 1607,
//       "trend": 12.299091544374562,
//       "data": {
//           "2024-09-16": 376,
//           "2024-09-17": 330,
//           "2024-09-18": 270,
//           "2024-09-19": 265,
//           "2024-09-20": 266,
//           "2024-09-21": 100
//       }
//   },
//   "Positive Feedback": {
//       "value": 1049,
//       "trend": 12.072649572649572,
//       "data": {
//           "2024-09-16": 242,
//           "2024-09-17": 222,
//           "2024-09-18": 173,
//           "2024-09-19": 170,
//           "2024-09-20": 177,
//           "2024-09-21": 65
//       }
//   },
//   "Negative Feedback": {
//       "value": 0,
//       "trend": 0,
//       "data": {
//           "2024-09-16": 134,
//           "2024-09-17": 108,
//           "2024-09-18": 97,
//           "2024-09-19": 95,
//           "2024-09-20": 89,
//           "2024-09-21": 35
//       }
//   },
//   "cardData": {
//       "Interactions": {
//           "value": 0,
//           "trend": 0,
//           "data": []
//       },
//       "Positive Feedback": {
//           "value": 0,
//           "trend": 0,
//           "data": []
//       },
//       "Negative Feedback": {
//           "value": 0,
//           "trend": 0,
//           "data": []
//       }
//   }
// }
const CategoriesReporting = (props) => {
  const { trendData, dailyData, cardData,setCardData} = props;
  console.log(props);
  
  const dispatch = useDispatch();
  // const fetchedDateRange = useSelector((state) => state.dateRange);
  // const trendData = useSelector((state) => state.fetchTrendData);
  // const dailyData = useSelector((state) => state.fetchDailyData);
  // const cardData = useSelector((state) => state.fetchCardData);
  //  console.log("myrtersergsgrsegseg",cardData);
  // console.log("myrtersergsgrsegseg",fetchedDateRange);

  const [cards, setCards] = useState([
    { category: "Interactions", isRemovable: false },
    { category: "Positive Feedback", isRemovable: false },
    { category: "Negative Feedback", isRemovable: false },
  ]);

  const [loading, setLoading] = useState(true);

  // Update cardData only when trendData and dailyData are available
  useEffect(() => {
    if (trendData && dailyData) {
      console.log("Setting card data with trendData and dailyData");
        setCardData({
          Interactions: {
            value: trendData.currentPeriod?.interactions || 0,
            trend: trendData.percentChanges?.interactions || 0,
            data: dailyData.interactions || [],
          },
          "Positive Feedback": {
            value: trendData.currentPeriod?.positive || 0,
            trend: trendData.percentChanges?.positive || 0,
            data: dailyData.positivedataset || [],
          },
          "Negative Feedback": {
            value: trendData.currentPeriod?.negative || 0,
            trend: trendData.percentChanges?.negative || 0,
            data: dailyData.negativedataset || [],
          },
        })
      //setLoading(false); // Data is loaded, update loading state
    }
  }, [trendData, dailyData]);

  // Log cardData updates
  useEffect(() => {
    if (cardData) {
      console.log("Updated card data:", cardData);
    }
    setLoading(false)
  }, [cardData]);

  if (loading) {
    return <div>Loading...</div>;
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
            maxWidth: "60%",
            margin: "0px auto 30px",
          }}
        >
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ minWidth: "900px" }}
          >
            {cards.map((card, index) => {
              const trend = cardData[card.category].trend >= 0 ? "up" : "down";
              const chartColor = trend === "up" ? "#00FF00" : "#991350"; // Green for positive, Purple for negative

              return (
                <Grid item xs={2} sm={2} md={2.4} lg={2.4} xl={2.4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
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
                                {cardData[card.category]?.value || 0}
                              </Typography>
                              <Tooltip
                                title={`There was a ${Math.abs(
                                  cardData[card.category]?.trend || 0
                                ).toFixed(2)}% ${
                                  trend === "up" ? "increase" : "decrease"
                                } in the last 7 days`}
                              >
                                <Chip
                                  size="small"
                                  color={trend === "up" ? "success" : "error"}
                                  sx={{ fontSize: ".9rem" }}
                                  label={`${trend === "up" ? "+" : ""}${(
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
                              Last 7 Days
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import DownloadTabView from "./DownloadTabView";
import { useSelector } from "react-redux";
import {
  getDownloadTopicsAllData,
  getDownloadTopicsCount,
  insertUserInfo,
} from "../API/TopicAPI";
import Loading from "../Loading";

import * as XLSX from "xlsx";

import "./DialogStyle.css";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";

const DownloadView = () => {
  const [loading, setLoading] = useState(false);

  const [visible, setVisible] = useState(false);
  const fetchedDateRange = useSelector((state) => state.dateRange);
  const fetchedFilters = useSelector((state) => state.fetchFilters);
  const fetchedReduxData = useSelector((state) => state.fetchedData);
  const fetchedCurrentDate = useSelector((state) => state.fetchCurrentDate);
  const fetchedCurrentTopic = useSelector((state) => state.fetchCurrentTopic);
  const fetchedUserName = useSelector((state) => state.fetchUserName);

  // this is for summary data
  const [rowData, setRowData] = useState([]);
  // this is for entire data of topics in the format name: , data:
  const [finalData, setFinalData] = useState([]);

  //for storing selected topics
  const [selectedCities, setSelectedCities] = useState([]);

  // getting what are the topics need to display on display preview
  // const cities = fetchedReduxData.labels.map((item) => (
  //     { name: item }
  // ));
  const [cities, setCities] = useState([]);

  const getUniqniqueNames = (data) => {
    const uniqName = new Set();
    data.forEach((item) => uniqName.add(item[0]));
    return Array.from(uniqName);
  };
  const toast = useRef(null);
  const show = () => {
    toast.current.show({
      severity: "error",
      summary: "Invalid Date Range",
      detail: "Please select a valid date range",
    });
  };

  const downloadStartShow = () => {
    toast.current.show({
      severity: "info",
      summary: "Downloading started",
      detail: "Please wait sometime to get downloaded",
      life: 3000,
    });
  };

  const downloadSuccessShow = () => {
    toast.current.show({
      severity: "success",
      summary: "Successfully downloaded",
      detail: "Thanks for your patience",
      life: 3000,
    });
  };

  const downloadErrorShow = () => {
    toast.current.show({
      severity: "error",
      summary: "Download error",
      detail: "Sorry, please try after sometimes",
      life: 3000,
    });
  };

  const handleDownload = async () => {
    if (
      fetchedDateRange.startDate == null ||
      fetchedDateRange.endDate == null
    ) {
      console.log("please select date");
      // alert('Please select valid date');
      show();
    } else {
      setVisible(true);
      setLoading(true);

      setFinalData([]);
      setCities([]);
      setRowData([]);
      setSelectedCities([]);

      console.log("inside handle downlod topc");
      const response = await getDownloadTopicsCount({
        startDate: fetchedDateRange.startDate,
        endDate: fetchedDateRange.endDate,
        filterData: fetchedFilters,
      });
      setRowData(response.rows);
      let x = response.rows;

      //
      const TopicNames = getUniqniqueNames(x);
      // const TopicNames = fetchedReduxData.labels;

      console.log(
        response,
        "Dowwnload count api response --tahnks",
        TopicNames
      );
      //--------------------------

      TopicNames.map(async (item) => {
        const responseAllData = await getDownloadTopicsAllData({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
          filterData: fetchedFilters,
          topic_name: item,
        });
        setFinalData((prevData) => [
          ...prevData,
          { name: item, data: responseAllData.rows },
        ]);
        setCities((prevData) => [...prevData, { name: item }]);
        console.log(
          responseAllData,
          "Dowwnload all data api response --tahnks",
          item
        );
      });

      console.log(finalData, "FInal data for download topics");
      setTimeout(() => {
        setLoading(false);
      }, 50000);

      await insertUserInfo({
        UserName: fetchedUserName.userName,
        loginDate: new Date(),
        activityData: {
          dateRange: fetchedDateRange,
          filter: fetchedFilters,
          currentDate: fetchedCurrentDate.currentDate,
          currentTopic: fetchedCurrentTopic.currentTopic,

          topicDownload: {
            buttonClick: true,
            topicSelected: null,
            generatedExcel: false,
          },
          phraseDownload: {
            buttonClick: false,
            phrasesSelected: null,
            generatedExcel: false,
          },
        },
      });
    }
  };

  const handleDownload1 = async () => {
    setVisible(true);
    setLoading(true);

    setFinalData([]);
    setRowData([]);

    console.log(selectedCities, "selcted topic names");

    if (selectedCities.length > 0) {
      const response = await getDownloadTopicsCount({
        startDate: fetchedDateRange.startDate,
        endDate: fetchedDateRange.endDate,
        filterData: fetchedFilters,
      });
      setRowData(response.rows);

      selectedCities.map(async (item) => {
        const responseAllData = await getDownloadTopicsAllData({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
          filterData: fetchedFilters,
          topic_name: item.name,
        });
        setFinalData((prevData) => [
          ...prevData,
          { name: item.name, data: responseAllData.rows },
        ]);
        console.log(
          responseAllData,
          "Dowwnload all data api response --tahnks",
          item
        );
      });

      await insertUserInfo({
        UserName: fetchedUserName.userName,
        loginDate: new Date(),
        activityData: {
          dateRange: fetchedDateRange,
          filter: fetchedFilters,
          currentDate: fetchedCurrentDate.currentDate,
          currentTopic: fetchedCurrentTopic.currentTopic,

          topicDownload: {
            buttonClick: true,
            topicSelected: selectedCities,
            generatedExcel: false,
          },
          phraseDownload: {
            buttonClick: false,
            phrasesSelected: null,
            generatedExcel: false,
          },
        },
      });
    } else {
      console.log("inside handle downlod topc");
      const response = await getDownloadTopicsCount({
        startDate: fetchedDateRange.startDate,
        endDate: fetchedDateRange.endDate,
        filterData: fetchedFilters,
      });
      setRowData(response.rows);
      let x = response.rows;

      //
      const TopicNames = getUniqniqueNames(x);
      // const TopicNames = fetchedReduxData.labels;

      console.log(
        response,
        "Dowwnload count api response --tahnks",
        TopicNames
      );
      //--------------------------

      TopicNames.map(async (item) => {
        const responseAllData = await getDownloadTopicsAllData({
          startDate: fetchedDateRange.startDate,
          endDate: fetchedDateRange.endDate,
          filterData: fetchedFilters,
          topic_name: item,
        });
        setFinalData((prevData) => [
          ...prevData,
          { name: item, data: responseAllData.rows },
        ]);
        console.log(
          responseAllData,
          "Dowwnload all data api response --tahnks",
          item
        );
      });
    }

    console.log(finalData, "FInal data for download topics");
    setTimeout(() => {
      setLoading(false);
    }, 30000);
  };

  const truncateSheetName = (name) => {
    return name.length > 31
      ? name.substring(0, 31 - (Math.floor(Math.random() * (20 - 5 + 1)) + 5)) +
          "..."
      : name;
  };
  const [links, setLinks] = useState([]);

  //convert UTC time to normal time
  const convertTime = (utcString) => {
    let utcDate = new Date(utcString);

    let localTimeString = utcDate.toLocaleString();
    return localTimeString;
  };

  const generateExcel = async (summaryData, conversationData) => {
    const wb = XLSX.utils.book_new();
    // Add summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    summarySheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Add conversation sheets
    conversationData.forEach((conversation, index) => {
      let x = conversation.data;
      // '=HYPERLINK("https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/item[0], "item[0")'
      let data1 = [
        [
          "Conversation ID",
          "Start Date",
          "DNIS",
          "Queue",
          "Client ID",
          "Market Type",
          "LOB",
          "Agent Name",
          "Call Duration(mins)",
          "Sentiment Score",
          "Topic",
          "Phrase",
        ],
      ];
      let data = x.map((item) =>
        data1.push([
          item[0],
          convertTime(item[1]),
          item[2],
          item[3],
          item[4],
          item[5],
          item[6],
          item[7],
          item[8],
          Math.round(item[9] * 100),
          item[10],
          item[11],
        ])
      );
      // let data = x.map((item) => (
      //     {
      //         'Conversation ID': item[0],
      //         'Start Date': item[1],
      //         "DNIS": item[2],
      //         "Queue": item[3],
      //         "Client ID": item[4],
      //         "Market Type": item[5],
      //         "LOB": item[6],
      //         "Agent ID": item[7],
      //         "Call Duration": item[8],
      //         "Sentiment Score": Math.round(item[9]*100),
      //         "Topic": item[10],
      //         "Phrase": item[11]
      //     }
      // ))

      const truncateSheetName1 = truncateSheetName(
        conversation.name.replace(/\//g, "_")
      );
      console.log(truncateSheetName1);
      // const conversationSheet = XLSX.utils.json_to_sheet(data);
      const conversationSheet = XLSX.utils.aoa_to_sheet(data1);
      conversationSheet["!cols"] = [
        { wch: 35 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
      ];
      //   conversationData.map((item, index) => {
      //     const cellAddress = XLSX.utils.encode_cell({c: 0, r:index+1});
      //     conversationSheet[cellAddress] = {Target: 'www.google.com'}
      //   })

      for (let i = 1; i < data1.length; i++) {
        const cellAddress = `A${i + 1}`;
        const cell = conversationSheet[cellAddress];
        if (!cell) continue;
        const id = data1[i][0];

        (cell.l = {
          Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${id}`,
          Tooltip: "Click to visit link",
          Rel: "nofollow",
        }),
          (cell.v = id);
      }
      XLSX.utils.book_append_sheet(wb, conversationSheet, truncateSheetName1);
    });
    // Generate Excel file and initiate download

    // Generate Excel file and initiate download
    let fileName = "HistoricalTrends " + date1 + " to " + date2 + ".xlsx";

    XLSX.writeFile(wb, fileName);
    console.log("successfuly donloaded");
  };

  const downloadAllTopicsExcel = async () => {
    downloadStartShow();

    // making as a json format for rowData
    // WO EB HO WS
    console.log("iniside download excel");
    //  const result = {};

    //  rowData.map((item) => {
    //     let name = item[0];
    //     if(!result[name]){
    //         result[name] = {
    //             item[0],
    //                 }
    //     }

    //  })
    const transformData = (data) => {
      // setCustomers(props.data.map((item) => (

      //     {name: item[0], count: item[1], percentage: item[2].toFixed(2), lob: item[3]}
      // )))
      const result = {};
      data.map((item) => {
        if (!result[item[0]]) {
          result[item[0]] = {
            Topic: item[0],
            countWS: 0,
            percentWS: 0,
            countWO: 0,
            percentWO: 0,
            countEB: 0,
            percentEB: 0,
            countHO: 0,
            percentHO: 0,
          };
        }

        switch (item[3]) {
          case "WS":
            result[item[0]].countWS = item[1];
            result[item[0]].percentWS = item[2].toFixed(2);
            break;
          case "WO":
            result[item[0]].countWO = item[1];
            result[item[0]].percentWO = item[2].toFixed(2);
            break;
          case "EB":
            result[item[0]].countEB = item[1];
            result[item[0]].percentEB = item[2].toFixed(2);
            break;
          case "HO":
            result[item[0]].countHO = item[1];
            result[item[0]].percentHO = item[2].toFixed(2);
            break;
          default:
            break;
        }
      });
      return Object.values(result);
    };
    // const Summary = rowData.map((item) =>(
    //     // {
    //     //     Topic: item[0],
    //     //     Count : item[1],
    //     //     '% in WO': item[2].toFixed(2),
    //     //     // '% in WS':1,
    //     //     // '% in EB':2,
    //     //     // '% in HO': 3
    //     // }
    // ))
    const Summary = transformData(rowData);

    console.log(Summary, finalData, "Summary and final dtaa");
    // await generateExcel(Summary, finalData);

    setTimeout(async () => {
      try {
        await generateExcel(Summary, finalData);

        downloadSuccessShow();

        await insertUserInfo({
          UserName: fetchedUserName.userName,
          loginDate: new Date(),
          activityData: {
            dateRange: fetchedDateRange,
            filter: fetchedFilters,
            currentDate: fetchedCurrentDate.currentDate,
            currentTopic: fetchedCurrentTopic.currentTopic,

            topicDownload: {
              buttonClick: true,
              topicSelected: selectedCities,
              generatedExcel: true,
            },
            phraseDownload: {
              buttonClick: false,
              phrasesSelected: null,
              generatedExcel: false,
            },
          },
        });
      } catch (error) {
        downloadErrorShow();
      }
    }, 5000);

    console.log("successfully donwloaded");
  };

  const formatDate = (dateString) => {
    let dateObject = new Date(dateString);
    dateObject.setDate(dateObject.getDate() + 1);
    let endDate = dateObject.toISOString().split("T")[0];

    var date = new Date(endDate);
    var options = { day: "numeric", month: "long", year: "numeric" };
    var formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(date);
  };

  const date1 = formatDate(fetchedDateRange.startDate);
  const date2 = formatDate(fetchedDateRange.endDate);

  return (
    <div className="card flex  ">
      <Toast ref={toast} />
      <Button
        label="Download"
        className=" mt-3 border mb-2 mr-2 text-white text-xs  font-semibold py-2 px-4 rounded-lg  "
        icon="pi pi-download"
        onClick={handleDownload}
      />

      <div className="bg-gradient-to-tl from-orange-400 via-amber-400 to-orange-400">
        <Dialog
          header="Topic Download Preview"
          className="custom-dialog"
          visible={visible}
          maximizable
          style={{ width: "80%" }}
          onHide={() => setVisible(false)}
        >
          {loading ? (
            <Loading />
          ) : (
            <>
              <p className="m-0 ">
                you can download the below data of topics from{" "}
                <b>
                  {" "}
                  {date1} to {date2}
                </b>{" "}
                as excel format
                <button
                  icon="pi pi-download"
                  className="px-2 py-1  text-black font-extrabold"
                  onClick={downloadAllTopicsExcel}
                >
                  <i className="pi pi-download"></i>
                </button>
              </p>
              <div className="flex justify-end items-center text-xs mb-2">
                <MultiSelect
                  value={selectedCities}
                  onChange={(e) => setSelectedCities(e.value)}
                  options={cities}
                  optionLabel="name"
                  filter
                  placeholder="Select Topics"
                  maxSelectedLabels={3}
                  className="w-full mb-1 border md:w-60 "
                />

                <Button
                  label="Apply"
                  className="ml-3 bg-blue-950  border mb-2 mr-2 text-white text-xs  font-semibold py-3 px-8 rounded-lg  "
                  onClick={handleDownload1}
                />
              </div>
              <hr />
              <DownloadTabView rowData={rowData} finalData={finalData} />
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default DownloadView;


