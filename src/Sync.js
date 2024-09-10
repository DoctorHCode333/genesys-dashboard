const express = require('express');
const oracledb = require('oracledb');
const { format, parseISO, startOfWeek, endOfWeek } = require('date-fns');

const app = express();

// Set Oracle DB connection settings
const dbConfig = {
  user: 'GEN_INXNB',
  password: 'genidb!_pr04_v0y4',
  connectString: 'cti.apptoapp.org:1521/cti_Srvc.oracle.db',
};

app.get('/bot-feedback', async (req, res) => {
  const orgFormatter = 'yyyy-MM-dd';
  const targetFormatter = 'dd-MMM-yy';

  let fromDate = req.query.fromdate;
  let toDate = req.query.todate;
  let flob = req.query.flob || 'WS';

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
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'DD-MON-YY')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'DD-MON-YY')
    `;

    let positiveFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments = 'positive'
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'DD-MON-YY')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'DD-MON-YY')
    `;

    if (flob !== 'all') {
      negativeFeedbackQuery += ` AND LOB = :flob`;
      positiveFeedbackQuery += ` AND LOB = :flob`;
    }

    negativeFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    positiveFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';

    // Execute negative feedback query
    const negativeFeedbackResults = await connection.execute(negativeFeedbackQuery, {
      fromDate,
      toDate,
      flob,
    });

    const positiveFeedbackResults = await connection.execute(positiveFeedbackQuery, {
      fromDate,
      toDate,
      flob,
    });

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
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
////////////////////////



// Importing required libraries
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Oracle DB connection config
const dbConfig = {
  user: 'your_username',       // Your Oracle DB username
  password: 'your_password',   // Your Oracle DB password
  connectString: 'ctip.apptoapp.org:1521/ctip_Srvc.oracle.db', // Your Oracle DB connection string
};

// Query interaction count for ANI
const queryANI = async (startDate, endDate) => {
  let connection;
  try {
    // Connect to Oracle DB
    connection = await oracledb.getConnection(dbConfig);

    // SQL Query for ANI
    const query = `
      SELECT ANI, COUNT(*) AS COUNT 
      FROM CLOUD_STA_IXNS 
      WHERE ANI IS NOT NULL 
        AND STARTDATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') 
        AND TO_DATE(:endDate, 'YYYY-MM-DD') 
      GROUP BY ANI 
      ORDER BY COUNT DESC
    `;

    // Execute query
    const result = await connection.execute(query, { startDate, endDate }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Query interaction count for PARTY_ID
const queryPartyID = async (startDate, endDate) => {
  let connection;
  try {
    // Connect to Oracle DB
    connection = await oracledb.getConnection(dbConfig);

    // SQL Query for PARTY_ID
    const query = `
      SELECT PARTY_ID, COUNT(*) AS COUNT 
      FROM CLOUD_STA_IXNS 
      WHERE PARTY_ID IS NOT NULL 
        AND STARTDATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') 
        AND TO_DATE(:endDate, 'YYYY-MM-DD') 
      GROUP BY PARTY_ID 
      ORDER BY COUNT DESC
    `;

    // Execute query
    const result = await connection.execute(query, { startDate, endDate }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// API endpoint to handle both ANI and PARTY_ID requests
app.post('/api/interactions', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.body;

    // Validate input dates, and set default range (last 7 days)
    const currentDate = new Date();
    const defaultEndDate = currentDate.toISOString().split('T')[0]; // Current Date
    const defaultStartDate = new Date(currentDate.setDate(currentDate.getDate() - 7)).toISOString().split('T')[0]; // 7 days ago
    
    const finalStartDate = startDate || defaultStartDate;
    const finalEndDate = endDate || defaultEndDate;

    // Determine which query to run based on the 'type' parameter
    let data;
    if (type === 'ANI') {
      data = await queryANI(finalStartDate, finalEndDate);
    } else if (type === 'PARTY_ID') {
      data = await queryPartyID(finalStartDate, finalEndDate);
    } else {
      return res.status(400).json({ error: 'Invalid type. Choose "ANI" or "PARTY_ID"' });
    }

    // Send the result back to the frontend
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

/////

WITH ANI_COUNTS AS (
  SELECT ANI, COUNT(*) AS ANI_COUNT, ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS RNUM
  FROM CLOUD_STA_IXNS
  WHERE ANI IS NOT NULL
    AND STARTDATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
  GROUP BY ANI
  HAVING COUNT(*) > 4 AND COUNT(*) < 21
),
PARTY_ID_COUNTS AS (
  SELECT PARTY_ID, COUNT(*) AS PARTY_ID_COUNT, ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS RNUM
  FROM CLOUD_STA_IXNS
  WHERE PARTY_ID IS NOT NULL
    AND STARTDATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
  GROUP BY PARTY_ID
  HAVING COUNT(*) > 4 AND COUNT(*) < 21
)
SELECT 
    a.ANI, 
    a.ANI_COUNT, 
    p.PARTY_ID, 
    p.PARTY_ID_COUNT
FROM ANI_COUNTS a
FULL OUTER JOIN PARTY_ID_COUNTS p ON a.RNUM = p.RNUM
ORDER BY a.RNUM;




// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


///////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Grid,
  Chip,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useTheme } from "@mui/material/styles";
import { MultiSelect } from "primereact/multiselect";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { areaElementClasses } from "@mui/x-charts/LineChart";

const mockCategories = ["Positive Feedback", "Negative Feedback"];

const mockData = {
  "Positive Feedback": {
    value: "1.3K",
    trend: "up",
    color: "#00FF00",
    data: [2030, 5550, 615, 870, 560, 100, 1200],
  },
  Interions: {
    value: "3K",
    trend: "up",
    color: "#00FF00",
    data: [2030, 5550, 615, 870, 560, 100, 1200],
  }, // More fluctuations
  Interactions: {
    value: "8K",
    trend: "upo",
    color: "#991350",
    data: [200, 180, 170, 155, 140, 160, 150],
  }, // More irregular decline
  "Correct Welcome": {
    value: 80,
    trend: "up",
    color: "#00FF00",
    data: [70, 75, 60, 85, 70, 182, 90],
  }, // More ups and downs
  "Correct Guidance": {
    value: 40,
    trend: "down",
    color: "#991350",
    data: [50, 52, 147, 42, 35, 40, 138],
  }, // More variation with a general decline
  "S/R": {
    value: 200,
    trend: "up",
    color: "#00FF00",
    data: [50, 165, 180, 10, 510, 205, 220],
  }, // More dynamic upward trend
  "US/UR": {
    value: 90,
    trend: "up",
    color: "#00FF00",
    data: [80, 75, 85, 190, 80, 92, 190],
  }, // Irregular increases
  "Script Adherence": {
    value: 60,
    trend: "up",
    color: "#991350",
    data: [50, 55, 60, 150, 65, 62, 70],
  }, // Fluctuating increases
  "Connectivity Issue": {
    value: 20,
    trend: "down",
    color: "#991350",
    data: [42, 21, 20, 83, 19, 18, 20],
  }, // More noticeable fluctuations
  "Negative Feedback": {
    value: 420,
    trend: "down",
    color: "#a73698",
    data: [42, 21, 20, 83, 19, 18, 20],
  }, // More noticeable fluctuations
  "Complex Query": {
    value: 20,
    trend: "down",
    color: "#991350",
    data: [42, 21, 20, 83, 19, 18, 20],
  }, // More noticeable fluctuations
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
    { category: "Interactions", isRemovable: false },
    { category: "Positive Feedback", isRemovable: false },
    { category: "Negative Feedback", isRemovable: false },
    ,
  ]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const handleAddCard = () => {
    if (selectedCategory.length) {
      setCards([
        ...cards,
        ...selectedCategory.map((category) => ({
          category,
          isRemovable: true,
        })),
      ]);
      setSelectedCategory([]); // Clear selection after adding
    }
  };

  const handleDeleteCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const availableCategories = mockCategories.filter(
    (category) => !cards.map((card) => card.category).includes(category)
  );

  const trendValues = { upo: "-18%", up: "+35%", down: "-15%", neutral: "+5%" };

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
        <Grid container spacing={2} justifyContent="center">
          {cards.map((card, index) => {
            const trend = mockData[card.category].trend;
            const color =
              trend === "up"
                ? "success"
                : trend === "down"
                ? "error"
                : "default";
            const chartColor =
              trend === "up"
                ? theme.palette.success.main
                : theme.palette.error.main;

            return (
              <Grid
                item
                xs={7}
                sm={5}
                md={3}
                key={index}
                sx={{ maxWidth: 250 }}
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
                          onClick={() => handleDeleteCard(index)}
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
                                color={color}
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
                            colors={[chartColor]}
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
