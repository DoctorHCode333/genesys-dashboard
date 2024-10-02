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
  console.log("Date Range bot1", fromDate, toDate);

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
    interactionsQuery += " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)";
    negativeFeedbackQuery +=
      " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)";
    positiveFeedbackQuery +=
      " GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)";

    // Execute the queries
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

    // Process interaction resultsdsd
    const interactions = {};
    interactionsResults.rows.forEach((result) => {
      interactions[result[0].toISOString().split("T")[0]] = result[1];
    });

    // Process negative feedback resultsdd
    const negativeFeedback = {};
    negativeFeedbackResults.rows.forEach((result) => {
      negativeFeedback[result[0].toISOString().split("T")[0]] = result[1];
    });

    // Process positive feedback results
    const positiveFeedback = {};
    positiveFeedbackResults.rows.forEach((result) => {
      positiveFeedback[result[0].toISOString().split("T")[0]] = result[1];
    });

    // Ensure both datasets have the same keys
    const allDates = new Set([
      ...Object.keys(negativeFeedback),
      ...Object.keys(positiveFeedback),
      ...Object.keys(interactions),
    ]);

    allDates.forEach((date) => {
      if (!negativeFeedback[date]) negativeFeedback[date] = 0;
      if (!positiveFeedback[date]) positiveFeedback[date] = 0;
      if (!interactions[date]) interactions[date] = 0;
    });
    //console.log("fgfg",interactions);

    const sortedInteractions = Object.fromEntries(
      Object.entries(interactions).sort()
    );
    const sortedNegativeFeedback = Object.fromEntries(
      Object.entries(negativeFeedback).sort()
    );
    const sortedPositiveFeedback = Object.fromEntries(
      Object.entries(positiveFeedback).sort()
    );

    const interactionsArray = Object.values(sortedInteractions);
    const negativeFeedbackArray = Object.values(sortedNegativeFeedback);
    const positiveFeedbackArray = Object.values(sortedPositiveFeedback);
    let PFRArray = [];
    let NFRArray = [];
    let timePeriod = Object.keys(sortedInteractions);
    interactionsArray.forEach((value, index) => {
      if (value !== 0) {
        PFRArray.push((positiveFeedbackArray[index] / value) * 100);
        NFRArray.push((negativeFeedbackArray[index] / value) * 100);
      } else {
        PFRArray.push(0);
        NFRArray.push(0);
      }
    });

    const responsePayload = {
      interactions: sortedInteractions, // Include the sorted interactions count
      negativedataset: sortedNegativeFeedback,
      positivedataset: sortedPositiveFeedback,
      interactionsArray: interactionsArray,
      negativeFeedbackArray: negativeFeedbackArray,
      positiveFeedbackArray: positiveFeedbackArray,
      PFRArray: PFRArray,
      NFRArray: NFRArray,
      timePeriod: timePeriod,
      FeedSuccess: "True",
    };
    console.log("bot1resp", responsePayload);
    res.json(responsePayload);
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
    console.log("bot2", fromDate, " ", toDate);

    const period = differenceInDays(toDate, fromDate) + 1;
    console.log("per", period);

    const previousFromDate = format(
      subDays(parseISO(fromDate), period),
      targetFormatter
    );
    const previousToDate = format(
      subDays(parseISO(fromDate), 1),
      targetFormatter
    );
    console.log(previousFromDate, " ", previousToDate);

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

    const processTotals = (data) => ({
      interactions: data.rows[0][0],
      positive: data.rows[0][1],
      negative: data.rows[0][2],
    });

    const calcPercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.ceil(((current - previous) / previous) * 10000) / 100;
    };

    const calcRatio = (feedback, interactions) => {
      if (interactions === 0) return feedback > 0 ? 100 : 0;
      return (feedback / interactions) * 100;
    };
    const current = processTotals(currentTotals);
    const previous = processTotals(previousTotals);
    const pfrprev =
      Math.ceil(calcRatio(previous.positive, previous.interactions) * 100) /
      100;
    const pfrcurr =
      Math.ceil(calcRatio(current.positive, current.interactions) * 100) / 100;
    const pfr = Math.ceil((pfrcurr - pfrprev) * 1000) / 1000;
    const nfrcurr =
      Math.ceil(calcRatio(current.negative, current.interactions) * 100) / 100;
    const nfrprev =
      Math.ceil(calcRatio(previous.negative, previous.interactions) * 100) /
      100;
    const nfr = Math.ceil((nfrcurr - nfrprev) * 1000) / 1000;
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
      currentPeriod: { ...current, pfrcurr, nfrcurr },
      previousPeriod: { ...previous, pfrprev, nfrprev },
      percentChanges,
      FeedSuccess: "True",
    });

    res.json({
      currentPeriod: { ...current, pfrcurr, nfrcurr },
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

app.post("/bot-feedback-downloadData", async (req, res) => {
    const targetFormatter = "yyyy-MM-dd";
    let fromDate = req.body.startDate;
    let toDate = req.body.endDate;
    let connection;

    try {
        // Format and validate input date
        fromDate = format(parseISO(fromDate), targetFormatter);
        toDate = format(parseISO(toDate), targetFormatter);

        const period = differenceInDays(parseISO(toDate), parseISO(fromDate)) + 1;
        console.log(`Period: ${period}`);
        
        const previousFromDate = format(subDays(parseISO(fromDate), period), targetFormatter);
        const previousToDate = format(subDays(parseISO(fromDate), 1), targetFormatter);
        
        console.log(`Previous Dates: ${previousFromDate} - ${previousToDate}`);

        connection = await oracledb.getConnection(dbConfig); // Assume dbConfig is defined elsewhere
        
        // Fetch total data for current and previous periods
        const fetchTotalsQuery = `
            SELECT 
                COUNT(conversationid) AS interactions,
                SUM(CASE WHEN comments = 'positive' THEN 1 ELSE 0 END) AS positive,
                SUM(CASE WHEN comments != 'positive' THEN 1 ELSE 0 END) AS negative 
            FROM 
                botfeedback 
            WHERE 
                TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`;

        const currentTotals = await connection.execute(fetchTotalsQuery, { fromDate, toDate });
        const previousTotals = await connection.execute(fetchTotalsQuery, { fromDate: previousFromDate, toDate: previousToDate });

        const processTotals = (data) => ({
            interactions: data.rows[0][0],
            positive: data.rows[0][1],
            negative: data.rows[0][2],
        });

        const current = processTotals(currentTotals);
        const previous = processTotals(previousTotals);

        const calcPercentageChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.ceil(((current - previous) / previous) * 10000) / 100;
        };

        const pfrcurr = Math.ceil((current.positive / current.interactions) * 100) / 100 || 0;
        const nfrcurr = Math.ceil((current.negative / current.interactions) * 100) / 100 || 0;

        // Calculate the PFR/NFR ratio for interactions
        const pfrNfrRatio = (nfrcurr === 0) ? (pfrcurr * 100) : (pfrcurr / nfrcurr); // Prevent division by zero

        // Constructing the summaryData object
        const summaryData = {
            TotalInteractions: {
                header: 'Total interactions',
                count: current.interactions,
                percentageChange: calcPercentageChange(current.interactions, previous.interactions),
                pfrNfrRatio: pfrNfrRatio,
            },
            PositiveFeedback: {
                header: 'Positive feedback',
                count: current.positive,
                percentageChange: calcPercentageChange(current.positive, previous.positive),
                pfrNfrRatio: pfrcurr, // Use PFR for positive feedback
            },
            NegativeFeedback: {
                header: 'Negative feedback',
                count: current.negative,
                percentageChange: calcPercentageChange(current.negative, previous.negative),
                pfrNfrRatio: nfrcurr, // Use NFR for negative feedback
            },
        };

        // Prepare download data
        const positiveFeedbackData = await connection.execute(`
            SELECT comments
            FROM botfeedback
            WHERE comments = 'positive'
            AND TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`, 
            { fromDate, toDate });

        const negativeFeedbackData = await connection.execute(`
            SELECT comments
            FROM botfeedback
            WHERE comments != 'positive'
            AND TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`, 
            { fromDate, toDate });

        const downloadData = {
            positiveFeedback: positiveFeedbackData.rows,
            negativeFeedback: negativeFeedbackData.rows,
        };

        // Send response
        res.json({
            summaryData,
            downloadData,
            FeedSuccess: "True",
        });
    } catch (error) {
        console.error('Error:', error);
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
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { useDispatch } from "react-redux";
import { Box, Card, CardContent, Typography, IconButton, Grid, Chip, Tooltip, Stack } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";

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
  const { trendData, dailyData, cardData, setCardData } = props;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(0);

  const [cards, setCards] = useState([
    { category: "Total Feedback", isRemovable: false, description: `This card shows total count of feedback in last ${period} days.` },
    { category: "Positive Feedback", isRemovable: false, description: `This card shows total count of feedback in last ${period} days.` },
    { category: "Negative Feedback", isRemovable: false, description: `This card shows total count of feedback in last ${period} days.` },
    { category: "PFR", isRemovable: false, description: `This card shows total count of feedback in last ${period} days.` },
    { category: "NFR", isRemovable: false, description: `This card shows total count of feedback in last ${period} days.` },
  ]);

  useEffect(() => {
    if (Object.keys(trendData).length !== 0 && Object.keys(dailyData).length !== 0) {
      setCardData({
        "Total Feedback": {
          value: trendData.currentPeriod?.interactions || 0,
          trend: trendData.percentChanges?.interactions || 0,
          data: dailyData.interactionsArray || [],
        },
        "Positive Feedback": {
          value: trendData.currentPeriod?.positive || 0,
          trend: trendData.percentChanges?.positive || 0,
          data: dailyData.positiveFeedbackArray || [],
        },
        "Negative Feedback": {
          value: trendData.currentPeriod?.negative || 0,
          trend: trendData.percentChanges?.negative || 0,
          data: dailyData.negativeFeedbackArray || [],
        },
        PFR: {
          value: trendData.currentPeriod?.pfrcurr || 0,
          trend: trendData.percentChanges?.pfr || 0,
          data: dailyData.PFRArray || [],
        },
        NFR: {
          value: trendData.currentPeriod?.nfrcurr || 0,
          trend: trendData.percentChanges?.nfr || 0,
          data: dailyData.NFRArray || [],
        },
      });
    }
  }, [trendData, dailyData]);

  useEffect(() => {
    if (Object.keys(cardData).length !== 0) {
      setPeriod(dailyData.timePeriod.length);
      setLoading(false);
    }
  }, [cardData]);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <Box sx={{ mt: 3, maxWidth: "100%", mx: "auto" }}>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {cards.map((card, index) => {
            const category = card.category;
            const trend =
              cardData[category].trend >= 0
                ? category === "Negative Feedback" || category === "NFR"
                  ? "down"
                  : "up"
                : category === "Negative Feedback" || category === "NFR"
                ? "up"
                : "down";
            const trendData = cardData[category].trend;
            const chartColor = trend === "up" ? "#00FF00" : "#991350";

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={index}
                sx={{ display: "flex" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: "100%" }}
                >
                  <Card
                    variant="elevation"
                    sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  >
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
                          whiteSpace: "nowrap",
                          fontSize: "1rem",
                          color: "white",
                          fontFamily: "Optima, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        {card.category}
                      </Typography>
                      <Tooltip title={card.description}>
                        <IconButton sx={{ padding: 0, margin: 0 }} size="small">
                          <InfoIcon sx={{ color: "#fff", borderRadius: "50%", fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>

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
                      sx={{ backgroundColor: "white", padding: "8px", flexGrow: 1 }}
                    >
                      <Stack direction="column" sx={{ gap: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="h6"
                            component="p"
                            sx={{ fontSize: ".9rem", color: trend === "up" ? "#00FF00" : "#991350" }}
                          >
                            {cardData[card.category]?.value || 0}
                          </Typography>
                          <Tooltip
                            title={`There was a ${Math.abs(
                              cardData[card.category]?.trend || 0
                            ).toFixed(2)}% ${
                              trendData > 0 ? "increase" : "decrease"
                            } in the last ${period} days`}
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
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: ".9rem" }}>
                          Last {period} Days
                        </Typography>

                        <Box sx={{ width: "100%", height: 70, padding: "0px" }}>
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
      </Box>
    );
  }
};

export default CategoriesReporting;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/topics', (req, res) => {
    const startDate = req.body.startDate;
    let currentDate = req.body.endDate;

    let dateObject = new Date(currentDate);
    dateObject.setDate(dateObject.getDate() + 1);
    let endDate = dateObject.toISOString().split('T')[0];


    const queues = req.body.queues ? req.body.queues : [];
    const marketSector = req.body.marketSector ? req.body.marketSector : [];
    const participantType = req.body.participantType ? req.body.participantType : [];
    const lob = req.body.lob ? req.body.lob : [];
    const clientID = req.body.ClientID ? req.body.ClientID : [];
    const dnis = req.body.DNIS ? req.body.DNIS : [];

    const placeholdersForQueue = queues.map((_, i) => `:queue${i + 1}`).join(', ');
    const placeholdersForMS = marketSector.map((_, i) => `:ms${i + 1}`).join(', ');
    const placeholdersForPT = participantType.map((_, i) => `:pt${i + 1}`).join(', ');
    const placeholdersForlob = lob.map((_, i) => `:lob${i + 1}`).join(', ');
    const placeholdersForClientID = clientID.map((_, i) => `:cid${i + 1}`).join(', ');
    const placeholdersForDNIS = dnis.map((_, i) => `:dnis${i + 1}`).join(', ');






    let query = `SELECT topicname,TO_CHAR(TRUNC(startdate), 'YYYY-MM-DD') AS start_date,COUNT(*)
    FROM HIST_TOPICS_IXNS 
    WHERE CAST(startdate AS TIMESTAMP WITH TIME ZONE) >= TO_TIMESTAMP_TZ('${startDate}', 'YYYY-MM-DD HH24:MI:SS TZH:TZM') 
    AND CAST(startdate AS TIMESTAMP WITH TIME ZONE) <= TO_TIMESTAMP_TZ('${endDate}', 'YYYY-MM-DD HH24:MI:SS TZH:TZM') 
    AND topicname IN ('Escalate to Supervisor', 'Misinformation- Incorrect Information Provided',
   'Misinformation- Information NOT Provided',
    'Distribution/Money Out',
    'Reallocation',
    'Account Information Update',
    'Money Management',
    'Make Payment',
    'Incorrect Address',
   'Digital Experience',
    'Hardship',
    'Fund to Fund Transfer',
    'Transaction Status',
    'RMD',
    'ACH',
    'Loans',
    'Address Change',
    'Cash Out',
    'Statements',
    'Investment Elections',
    'Pension',
   
    'Contribution Change',
    
    'Rollover') AND lob='WS'`;
    { req.body.queues.length > 0 ? query += ` AND queue IN (${placeholdersForQueue})` : null };
    { req.body.marketSector.length > 0 ? query += ` AND market_type IN (${placeholdersForMS})` : null };
    { req.body.participantType.length > 0 ? query += ` AND participant_type IN (${placeholdersForPT})` : null };
    { req.body.lob.length > 0 ? query += ` AND lob IN (${placeholdersForlob})` : null };
    { req.body.ClientID.length > 0 ? query += ` AND clientid IN (${placeholdersForClientID})` : null };
    { req.body.DNIS.length > 0 ? query += ` AND dnis IN (${placeholdersForDNIS})` : null };


    query += ` GROUP BY topicname, TRUNC(startdate)
    ORDER BY topicname, TRUNC(startdate)`;

    let binds = {}
    queues.forEach((queue, index) => {
        binds[`queue${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: queue.name,
            type: oracledb.STRING
        }
    });

    marketSector.forEach((ms, index) => {
        binds[`ms${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: ms.name,
            type: oracledb.STRING
        }
    });

    participantType.forEach((pt, index) => {
        binds[`pt${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: pt.name,
            type: oracledb.STRING
        }
    });

    lob.forEach((lob, index) => {
        binds[`lob${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: lob.name,
            type: oracledb.STRING
        }
    });

    clientID.forEach((cid, index) => {
        binds[`cid${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: cid.name,
            type: oracledb.STRING
        }
    });

    dnis.forEach((dnis, index) => {
        binds[`dnis${index + 1}`] = {
            dir: oracledb.BIND_IN,
            val: dnis.name,
            type: oracledb.STRING
        }
    });



    console.log(binds, 'binds', query)





    async function fetchDataInteractions() {
        try {
            // const connection = await oracledb.getConnection({
            //     user: 'GEN_IXNDB',
            //     password: 'genidb!_pr04_v0y4',
            //     connectionString: 'gsysp-new.apptoapp.org/gsysp_Srvc.oracle.db'
            // });
            const connection = await oracledb.getConnection({
                user: 'GEN_IXNDB',
                password: 'Knu54h#I4dmE6P9a',
                connectionString: 'ctip.apptoapp.org:1521/ctip_Srvc.oracle.db'
            });
            console.log('env ', process.platform)
            const results = await connection.execute(query, binds);
            console.log(results);
            return results;


        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataInteractions()
        .then(dbres => {
            //console.log(dbres);
            console.log('env ', process.platform);
            console.log(dbres, 'db result')
            res.status(200).send(dbres);

        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ message: "Internal Server Error", Error: err })
        })
})
