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
  SELECT ANI, COUNT(*) AS ANI_COUNT
  FROM CLOUD_STA_IXNS
  WHERE ANI IS NOT NULL
    AND STARTDATE BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
  GROUP BY ANI
  HAVING COUNT(*) > 4 AND COUNT(*) < 21
),
PARTY_ID_COUNTS AS (
  SELECT PARTY_ID, COUNT(*) AS PARTY_ID_COUNT
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
FULL OUTER JOIN PARTY_ID_COUNTS p ON 1 = 1
ORDER BY a.ANI_COUNT DESC, p.PARTY_ID_COUNT DESC;



// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
