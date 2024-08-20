const express = require('express');
const mysql = require('mysql2/promise');
const { format, parseISO, startOfWeek, endOfWeek, subDays } = require('date-fns');

const app = express();

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

    // Database connection
    connection = await mysql.createConnection({
      host: 'gsysp-new.apptoapp.org',
      user: 'GEN_INXNB',
      password: 'genidb!_pr04_v0y4',
      database: 'gsysp_Srvc.oracle.db',
    });

    let negativeFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments != 'positive'
      AND TRUNC(startdate) >= ?
      AND TRUNC(startdate) <= ?
    `;

    let positiveFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments = 'positive'
      AND TRUNC(startdate) >= ?
      AND TRUNC(startdate) <= ?
    `;

    if (flob !== 'all') {
      negativeFeedbackQuery += ` AND LOB = '${flob}'`;
      positiveFeedbackQuery += ` AND LOB = '${flob}'`;
    }

    negativeFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';
    positiveFeedbackQuery += ' GROUP BY TRUNC(startdate) ORDER BY TRUNC(startdate)';

    const [negativeFeedbackResults] = await connection.execute(negativeFeedbackQuery, [fromDate, toDate]);
    const [positiveFeedbackResults] = await connection.execute(positiveFeedbackQuery, [fromDate, toDate]);

    const negativeFeedback = {};
    const positiveFeedback = {};

    negativeFeedbackResults.forEach(result => {
      negativeFeedback[result[0].replace(' 00:00:00.0', '')] = result[1];
    });

    positiveFeedbackResults.forEach(result => {
      positiveFeedback[result[0].replace(' 00:00:00.0', '')] = result[1];
    });

    // Make sure both datasets have the same keys
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
      await connection.end();
    }
    res.json({ FeedFail: 'True' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
