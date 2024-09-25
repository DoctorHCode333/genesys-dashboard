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

    const period = differenceInDays(toDate,fromDate)+1;
    console.log(period);
    
    const previousFromDate = format(
      subDays(parseISO(fromDate), period),
      targetFormatter
    );
    const previousToDate = format(
      subDays(parseISO(fromDate), 1),
      targetFormatter
    );
    console.log(previousFromDate, " ",previousToDate);
    
    connection = await oracledb.getConnection(dbConfig);
    // Fetch total data for current and previous periods
    const fetchTotalsQuery = `SELECT COUNT(conversationid) AS interactions,SUM(CASE WHEN comments = 'positive' THEN 1 ELSE 0 END) AS positive,SUM(CASE WHEN comments != 'positive' THEN 1 ELSE 0 END) AS negative FROM botfeedback WHERE TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`;

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
      return Math.ceil(((current - previous) / previous) * 10000)/100;
    };
   
    const calcRatio = (feedback, interactions) => {
      if (interactions === 0) return feedback > 0 ? 100 : 0;
      return ((feedback / interactions)*100);
    };
    const current = processTotals(currentTotals);
    const previous = processTotals(previousTotals);
    const pfrprev = Math.ceil(calcRatio(previous.positive,previous.interactions)*100)/100
    const pfrcurr = Math.ceil(calcRatio(current.positive,current.interactions)*100)/100;
    const pfr = Math.ceil((pfrcurr-pfrprev)*1000)/1000;
    const nfrcurr = Math.ceil(calcRatio(current.negative,current.interactions)*100)/100;
    const nfrprev = Math.ceil(calcRatio(previous.negative,previous.interactions)*100)/100;
    const nfr = Math.ceil((nfrcurr-nfrprev)*1000)/1000;
    // Calculate percentage changes
    const percentChanges = {
      interactions: calcPercentageChange(
        current.interactions,
        previous.interactions
      ),
      positive: calcPercentageChange(current.positive, previous.positive),
      negative: calcPercentageChange(current.negative, previous.negative),
      pfr: pfr,
      nfr: nfr,
    };
    console.log({
      currentPeriod: {...current,pfrcurr,nfrcurr},
      previousPeriod:{...previous,pfrprev,nfrprev},
      percentChanges,
      FeedSuccess: "True",
    });

    res.json({
      currentPeriod: {...current,pfrcurr,nfrcurr},
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
import { useSelector } from "react-redux";
import Loading from "../Loading";
import * as XLSX from "xlsx";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import DownloadTabView from "./DownloadTabView";

// Mock API function for demonstration
const fetchDownloadData = async ({ startDate, endDate }) => {
  // Replace this with the actual API call
  return {
    summary: [{ topic: "Example", count: 10, percentage: 50 }],
    positiveFeedback: [
      { id: 1, comment: "Great service!", sentiment: "positive" },
    ],
    negativeFeedback: [
      { id: 2, comment: "Bad experience.", sentiment: "negative" },
    ],
  };
};

const DownloadView = ({ summaryData }) => {
  const [visible, setVisible] = useState(false);
  const [downloadData, setDownloadData] = useState({
    summary: [],
    positiveFeedback: [],
    negativeFeedback: [],
  });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchedDateRange = useSelector((state) => state.dateRange);

  const toast = useRef(null);

  const showExcelDownloadToast = () => {
    toast.current.show({
      severity: "info",
      summary: "Excel Download",
      detail: "The Excel file is being generated and will download shortly.",
      life: 3000,
    });
  };

  const showDownloadSuccessToast = () => {
    toast.current.show({
      severity: "success",
      summary: "Download Complete",
      detail: "The Excel file has been successfully downloaded.",
      life: 3000,
    });
  };

  const showDownloadErrorToast = () => {
    toast.current.show({
      severity: "error",
      summary: "Download Failed",
      detail: "An error occurred during the download. Please try again.",
      life: 3000,
    });
  };

  // Fetches the data and displays the dialog.
  const handleDownload = async () => {
    if (!fetchedDateRange.startDate || !fetchedDateRange.endDate) {
      toast.current.show({
        severity: "error",
        summary: "Invalid Date Range",
        detail: "Please select a valid date range.",
      });
      return;
    }

    setLoading(true);
    setVisible(true); // Show the dialog

    try {
      const response = await fetchDownloadData({
        startDate: fetchedDateRange.startDate,
        endDate: fetchedDateRange.endDate,
      });

      setDownloadData(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setVisible(false); // Hide the dialog on error
      showDownloadErrorToast();
    }
  };

  // This function generates the Excel file based on the downloadData state.
  const generateExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Adding Summary Sheet
      const summarySheet = XLSX.utils.json_to_sheet(downloadData.summary);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // Adding Positive Feedback Sheet
      const positiveSheet = XLSX.utils.json_to_sheet(downloadData.positiveFeedback);
      XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");

      // Adding Negative Feedback Sheet
      const negativeSheet = XLSX.utils.json_to_sheet(downloadData.negativeFeedback);
      XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");

      const fileName = `FeedbackData ${fetchedDateRange.startDate} to ${fetchedDateRange.endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showDownloadSuccessToast();
    } catch (error) {
      showDownloadErrorToast();
    }
  };

  // This function is called when the user clicks the download button inside the dialog.
  const downloadExcelData = () => {
    showExcelDownloadToast(); // Show toast indicating download is starting
    generateExcel(); // Generate and download Excel file
  };

  return (
    <div className="card flex">
      <Toast ref={toast} />
      <Button
        label="Download"
        className="mt-3 border mb-2 mr-2 text-white text-xs font-semibold py-2 px-4 rounded-lg"
        icon="pi pi-download"
        onClick={handleDownload}
      />

      <div className="bg-gradient-to-tl from-orange-400 via-amber-400 to-orange-400">
        <Dialog
          header="Data Download Preview"
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
              <p className="m-0">
                You can download the below data from{" "}
                <b>
                  {fetchedDateRange.startDate} to {fetchedDateRange.endDate}
                </b>{" "}
                as an Excel file.
                <button
                  className="px-2 py-1 text-black font-extrabold"
                  onClick={downloadExcelData}
                >
                  <i className="pi pi-download"></i>
                </button>
              </p>
              <div className="flex justify-end items-center text-xs mb-2">
                <MultiSelect
                  value={selectedTopics}
                  onChange={(e) => setSelectedTopics(e.value)}
                  options={[
                    { name: "Summary" },
                    { name: "Positive Feedback" },
                    { name: "Negative Feedback" },
                  ]}
                  optionLabel="name"
                  placeholder="Select Topics"
                  maxSelectedLabels={3}
                  className="w-full mb-1 border md:w-60"
                />

                <Button
                  label="Apply"
                  className="ml-3 bg-blue-950 border mb-2 mr-2 text-white text-xs font-semibold py-3 px-8 rounded-lg"
                  onClick={() => {
                    // This Apply button can be used to filter the data shown in the tabs if necessary.
                  }}
                />
              </div>
              <hr />
              <DownloadTabView
                summaryData={downloadData.summary}
                positiveFeedback={downloadData.positiveFeedback}
                negativeFeedback={downloadData.negativeFeedback}
              />
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default DownloadView;
