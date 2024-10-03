// Function to fetch data from the database
const fetchData = async (query, binds) => {
  const connection = await oracledb.getConnection(dbConfig);
  try {
    const result = await connection.execute(query, binds);
    return result;
  } finally {
    await connection.close();
  }
};

app.post("/bot-feedback", async (req, res) => {
  const orgFormatter = "yyyy-MM-dd";
  const targetFormatter = "yyyy-MM-dd";
  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;

  // Extract filters
  const lob = req.body.lob || [];
  const deviceType = req.body.deviceType || [];
  const interactionReason = req.body.interactionReason || [];

  // Generate placeholders for the filters
  const placeholdersForLob = lob.map((_, i) => `:lob${i + 1}`).join(', ');
  const placeholdersForDeviceType = deviceType.map((_, i) => `:deviceType${i + 1}`).join(', ');
  const placeholdersForInteractionReason = interactionReason.map((_, i) => `:interactionReason${i + 1}`).join(', ');

  let firstLoad = false;

  try {
    // If fromDate and toDate are not provided, set them to the current week
    if ((!fromDate || fromDate === "") && (!toDate || toDate === "")) {
      const today = new Date();
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });

      fromDate = format(startOfWeekDate, targetFormatter);
      toDate = format(endOfWeekDate, targetFormatter);
      firstLoad = true;
    } else {
      // If dates are provided, parse them to the target format
      fromDate = format(parseISO(fromDate), targetFormatter);
      toDate = format(parseISO(toDate), targetFormatter);
    }

    // Define queries
    const interactionsQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')`;

    // Append filters to the interactions query if they are provided
    if (lob.length > 0) interactionsQuery += ` AND lob IN (${placeholdersForLob})`;
    if (deviceType.length > 0) interactionsQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
    if (interactionReason.length > 0) interactionsQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

    const negativeFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments != 'positive'
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')`;

    // Append filters to the negative feedback query if they are provided
    if (lob.length > 0) negativeFeedbackQuery += ` AND lob IN (${placeholdersForLob})`;
    if (deviceType.length > 0) negativeFeedbackQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
    if (interactionReason.length > 0) negativeFeedbackQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

    const positiveFeedbackQuery = `
      SELECT TRUNC(startdate), COUNT(conversationid)
      FROM botfeedback
      WHERE comments = 'positive'
      AND TRUNC(startdate) >= TO_DATE(:fromDate, 'YYYY-MM-DD')
      AND TRUNC(startdate) <= TO_DATE(:toDate, 'YYYY-MM-DD')`;

    // Append filters to the positive feedback query if they are provided
    if (lob.length > 0) positiveFeedbackQuery += ` AND lob IN (${placeholdersForLob})`;
    if (deviceType.length > 0) positiveFeedbackQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
    if (interactionReason.length > 0) positiveFeedbackQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

    // Bind parameters
    const binds = { fromDate, toDate };
    lob.forEach((lobVal, index) => { binds[`lob${index + 1}`] = lobVal; });
    deviceType.forEach((device, index) => { binds[`deviceType${index + 1}`] = device; });
    interactionReason.forEach((reason, index) => { binds[`interactionReason${index + 1}`] = reason; });

    // Execute queries in parallel
    Promise.all([
      fetchData(interactionsQuery, binds),
      fetchData(negativeFeedbackQuery, binds),
      fetchData(positiveFeedbackQuery, binds)
    ])
      .then(([interactionsResults, negativeFeedbackResults, positiveFeedbackResults]) => {
        // Process interaction results
        const interactions = {};
        interactionsResults.rows.forEach((result) => {
          interactions[result[0].toISOString().split("T")[0]] = result[1];
        });

        // Process negative feedback results
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
          // Set to zero if no data is present for that day
          if (!negativeFeedback[date]) negativeFeedback[date] = 0;
          if (!positiveFeedback[date]) positiveFeedback[date] = 0;
          if (!interactions[date]) interactions[date] = 0;
        });

        const sortedInteractions = Object.fromEntries(Object.entries(interactions).sort());
        const sortedNegativeFeedback = Object.fromEntries(Object.entries(negativeFeedback).sort());
        const sortedPositiveFeedback = Object.fromEntries(Object.entries(positiveFeedback).sort());

        const interactionsArray = Object.values(sortedInteractions);
        const negativeFeedbackArray = Object.values(sortedNegativeFeedback);
        const positiveFeedbackArray = Object.values(sortedPositiveFeedback);
        
        let PFRArray = [];
        let NFRArray = [];
        let timePeriod = Object.keys(sortedInteractions);
        
        interactionsArray.forEach((value, index) => {
          const positiveValue = positiveFeedbackArray[index] || 0; // Set to zero if undefined
          const negativeValue = negativeFeedbackArray[index] || 0; // Set to zero if undefined

          // Prevent division by zero for PFR and NFR calculations
          PFRArray.push(value > 0 ? (positiveValue / value) * 100 : 0);
          NFRArray.push(value > 0 ? (negativeValue / value) * 100 : 0);
        });

        const responsePayload = {
          interactions: sortedInteractions,
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
      })
      .catch((error) => {
        console.error(error);
        res.json({ FeedFail: "True" });
      });
  } catch (error) {
    console.error(error);
    res.json({ FeedFail: "True" });
  }
});

app.post("/bot-feedback-trend", async (req, res) => {
  const targetFormatter = "yyyy-MM-dd";
  let fromDate = req.body.startDate;
  let toDate = req.body.endDate;

  // Extract filters
  const lob = req.body.lob || [];
  const deviceType = req.body.deviceType || [];
  const interactionReason = req.body.interactionReason || [];
  
  // Generate placeholders for the filters
  const placeholdersForLob = lob.map((_, i) => `:lob${i + 1}`).join(', ');
  const placeholdersForDeviceType = deviceType.map((_, i) => `:deviceType${i + 1}`).join(', ');
  const placeholdersForInteractionReason = interactionReason.map((_, i) => `:interactionReason${i + 1}`).join(', ');

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
    const fetchTotalsQuery = `
      SELECT 
        COUNT(conversationid) AS interactions,
        SUM(CASE WHEN comments = 'positive' THEN 1 ELSE 0 END) AS positive,
        SUM(CASE WHEN comments != 'positive' THEN 1 ELSE 0 END) AS negative 
      FROM 
        botfeedback 
      WHERE 
        TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`;

    // Append filters to the fetchTotalsQuery if they are provided
    if (lob.length > 0) fetchTotalsQuery += ` AND lob IN (${placeholdersForLob})`;
    if (deviceType.length > 0) fetchTotalsQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
    if (interactionReason.length > 0) fetchTotalsQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

    // Prepare binds for query
    const binds = { fromDate, toDate };
    lob.forEach((lobVal, index) => { binds[`lob${index + 1}`] = lobVal; });
    deviceType.forEach((device, index) => { binds[`deviceType${index + 1}`] = device; });
    interactionReason.forEach((reason, index) => { binds[`interactionReason${index + 1}`] = reason; });

    // Execute current totals query
    const currentTotals = await connection.execute(fetchTotalsQuery, binds);

    // Execute previous totals query
    const previousTotals = await connection.execute(fetchTotalsQuery, {
      ...binds,
      fromDate: previousFromDate,
      toDate: previousToDate,
    });

    const processTotals = (data) => ({
      interactions: data.rows[0][0] || 0, // Set to zero if undefined
      positive: data.rows[0][1] || 0,     // Set to zero if undefined
      negative: data.rows[0][2] || 0,     // Set to zero if undefined
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
    
    const pfrprev = Math.ceil(calcRatio(previous.positive, previous.interactions) * 100) / 100;
    const pfrcurr = Math.ceil(calcRatio(current.positive, current.interactions) * 100) / 100;
    const pfr = Math.ceil((pfrcurr - pfrprev) * 1000) / 1000;

    const nfrcurr = Math.ceil(calcRatio(current.negative, current.interactions) * 100) / 100;
    const nfrprev = Math.ceil(calcRatio(previous.negative, previous.interactions) * 100) / 100;
    const nfr = Math.ceil((nfrcurr - nfrprev) * 1000) / 1000;

    // Calculate percentage changes
    const percentChanges = {
      interactions: calcPercentageChange(current.interactions, previous.interactions),
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

    const lob = req.body.lob || [];
    const deviceType = req.body.deviceType || [];
    const interactionReason = req.body.interactionReason || [];

    // Prepare placeholders for filtering
    const placeholdersForLob = lob.map((_, i) => `:lob${i + 1}`).join(', ');
    const placeholdersForDeviceType = deviceType.map((_, i) => `:deviceType${i + 1}`).join(', ');
    const placeholdersForInteractionReason = interactionReason.map((_, i) => `:interactionReason${i + 1}`).join(', ');

    let connection;

    try {
        // Format and validate input date
        fromDate = format(parseISO(fromDate), targetFormatter);
        toDate = format(parseISO(toDate), targetFormatter);
        console.log("bot3Date", fromDate, "     ", toDate);

        const period = differenceInDays(parseISO(toDate), parseISO(fromDate)) + 1;
        console.log(`Period:bot3 ${period}`);

        const previousFromDate = format(subDays(parseISO(fromDate), period), targetFormatter);
        const previousToDate = format(subDays(parseISO(fromDate), 1), targetFormatter);

        console.log(`Previous Dates: ${previousFromDate} - ${previousToDate}`);

        connection = await oracledb.getConnection(dbConfig); // Assume dbConfig is defined elsewhere

        // Fetch total data for current and previous periods with filters
        let fetchTotalsQuery = `
            SELECT 
                COUNT(conversationid) AS interactions,
                SUM(CASE WHEN comments = 'positive' THEN 1 ELSE 0 END) AS positive,
                SUM(CASE WHEN comments != 'positive' THEN 1 ELSE 0 END) AS negative 
            FROM 
                botfeedback 
            WHERE 
                TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`;

        if (lob.length > 0) fetchTotalsQuery += ` AND lob IN (${placeholdersForLob})`;
        if (deviceType.length > 0) fetchTotalsQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
        if (interactionReason.length > 0) fetchTotalsQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

        // Bindings
        let binds = { fromDate, toDate };
        lob.forEach((lobVal, index) => { binds[`lob${index + 1}`] = lobVal; });
        deviceType.forEach((device, index) => { binds[`deviceType${index + 1}`] = device; });
        interactionReason.forEach((reason, index) => { binds[`interactionReason${index + 1}`] = reason; });

        // Fetch current and previous period data
        const currentTotals = await connection.execute(fetchTotalsQuery, binds);
        const previousTotals = await connection.execute(fetchTotalsQuery, {
            ...binds,
            fromDate: previousFromDate,
            toDate: previousToDate,
        });

        // Process totals
        const processTotals = (data) => ({
            interactions: data.rows[0] ? data.rows[0][0] || 0 : 0, // Handle undefined
            positive: data.rows[0] ? data.rows[0][1] || 0 : 0,     // Handle undefined
            negative: data.rows[0] ? data.rows[0][2] || 0 : 0,     // Handle undefined
        });

        const current = processTotals(currentTotals);
        const previous = processTotals(previousTotals);

        // Calculate percentage change
        const calcPercentageChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.ceil(((current - previous) / previous) * 10000) / 100;
        };

        // Calculate PF/NF ratios
        const pfrcurr = current.interactions > 0 
            ? Math.ceil((current.positive / current.interactions) * 10000) / 100 
            : 0; // Handle division by zero
        const nfrcurr = current.interactions > 0 
            ? Math.ceil((current.negative / current.interactions) * 10000) / 100 
            : 0; // Handle division by zero

        // Calculate PF/NF ratio
        const pfrNfrRatio = nfrcurr === 0 ? pfrcurr * 100 : pfrcurr / nfrcurr;

        // Constructing the summaryData object
        const summaryData = [
            {
                Header: "Total Feedback",
                Count: current.interactions,
                "Past Count": previous.interactions,
                Trend: calcPercentageChange(current.interactions, previous.interactions),
                "PF/NF Ratio": pfrNfrRatio,
            },
            {
                Header: "Positive Feedback",
                Count: current.positive,
                "Past Count": previous.positive,
                Trend: calcPercentageChange(current.positive, previous.positive),
                "PF/NF Ratio": pfrcurr,
            },
            {
                Header: "Negative Feedback",
                Count: current.negative,
                "Past Count": previous.negative,
                Trend: calcPercentageChange(current.negative, previous.negative),
                "PF/NF Ratio": nfrcurr,
            },
        ];

        console.log("summaryData", summaryData);

        // Fetch detailed feedback data for download with filters
        let feedbackQuery = `
            SELECT * 
            FROM botfeedback 
            WHERE TRUNC(startdate) BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')`;

        if (lob.length > 0) feedbackQuery += ` AND lob IN (${placeholdersForLob})`;
        if (deviceType.length > 0) feedbackQuery += ` AND device_type IN (${placeholdersForDeviceType})`;
        if (interactionReason.length > 0) feedbackQuery += ` AND interaction_reason IN (${placeholdersForInteractionReason})`;

        const positiveFeedbackData = await connection.execute(
            `${feedbackQuery} AND comments = 'positive'`,
            binds
        );

        const negativeFeedbackData = await connection.execute(
            `${feedbackQuery} AND comments != 'positive'`,
            binds
        );

        // Handle potential undefined or null values in feedback data
        const downloadData = {
            positiveFeedback: positiveFeedbackData.rows || [], // Ensure it's an array
            negativeFeedback: negativeFeedbackData.rows || [], // Ensure it's an array
        };

        console.log({
            summaryData,
            downloadData,
            FeedSuccess: "True",
        });

        // Send response
        res.json({
            summaryData,
            downloadData,
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
//////////////////////////////////////////////////////////////

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";

import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { data } from "autoprefixer";

import {
  setDateRange,
  setFetchedData,
  setFilters,
  setOriginalFetchedData,
  setSelectedTopics,
} from "../Redux/actions";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  getAllTopics,//not needed
  getClientId,//not needed
  getDnis,//not needed
  getDeviceType,//add new
  getLOB,//refine
  getInteractionReason,//add new
  getMarketType,//not needed
  getParticipantType,//not needed
  getQueue,//not needed
  getSelectedTopicsInOrder,//not needed
  getTopics,//not needed
  getTopTopics,//not needed
  insertUserInfo,//not needed
} from "../API/TopicAPI";

import { light } from "@mui/material/styles/createPalette";
// import DynamicDemo from './Messages/DynamicDemo';
import { useEffect } from "react";
import "./custom-style.css";

const PopupDoc = () => {
  const [responseArray, setResponseArray] = useState([]);

  const [visible, setVisible] = useState(false);
  const menu = useRef(null);
  const toast = useRef(null);
  const op = useRef(null);

  const toast1 = useRef(null);

  const show = () => {
    toast.current.show({
      severity: "error",
      summary: "Invalid Date Range",
      detail: "Please select a valid date range",
    });
  };

  // const showServerError = () => {
  //     toast.current.show({ severity: 'error', summary: 'Failed to fetch data from server', detail: 'Due to technical issue, please refresh the page' });
  // };

  const fetchedFilters = useSelector((state) => state.fetchFilters);
  const dateRange = useSelector((state) => state.dateRange);

  const fetchedUserName = useSelector((state) => state.fetchUserName);

  const [selectedLOB, setSelectedLOB] = useState(null);
  const [selectedMarketSector, setSelectedMarketSector] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedDNIS, setSelectedDNIS] = useState(null);

  const [allTopics, setAllTopics] = useState([]);
  const [selectedTopics, setSelectedTopic] = useState([]);

  const sortedItems = allTopics.sort((a, b) => {
    const aSelected = selectedTopics.some((item) => item.name === a.name);
    const bSelected = selectedTopics.some((item) => item.name === b.name);
    return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
  });

  // setting LOB and remianingf parameters
  const [LOB, setLOB] = useState([]);
  const [marketSector, setMarketSector] = useState([]);
  const [queues, setQueues] = useState([]);
  const [clientid, setClientId] = useState([]);
  const [dnis, setDnis] = useState([]);
  const [participant, setParticipant] = useState([]);

  useEffect(() => {
    setSelectedQueue(fetchedFilters.queues);
    setSelectedMarketSector(fetchedFilters.marketSector);
    setSelectedClientID(fetchedFilters.ClientID);
    setSelectedParticipant(fetchedFilters.participantType);
    setSelectedDNIS(fetchedFilters.DNIS);
    setSelectedLOB(fetchedFilters.lob);
  }, [fetchedFilters]);

  // console.log(selectedClientID, 'selected clientid')

  const formatDate = (dateString) => {
    // const date = new Date(dateString);
    // const options = { day: '2-digit', month: 'short', year: '2-digit'};
    // return date.toLocaleDateString('en-US', options);
    let dateObject = new Date(dateString);
    dateObject.setDate(dateObject.getDate() + 1);
    let endDate = dateObject.toISOString().split("T")[0];

    var date = new Date(endDate);
    var options = { day: "numeric", month: "short", year: "numeric" };
    var formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(date);
  };

  const clearSelections = () => {
    setSelectedClientID(null);
    setSelectedDNIS(null);
    setSelectedLOB(null);
    setSelectedMarketSector(null);
    setSelectedParticipant(null);
    setSelectedQueue(null);
    setSelectedTopic([]);
  };

  const fetchedReduxData = useSelector((state) => state.fetchedData);
  //console.log(fetchedReduxData, 'fethed data data inisde poup')

  const dispatch = useDispatch();

  // fetch unique names from the result of api
  const getUniqniqueNames = (data) => {
    //console.log('inside unique names', data)
    const uniqName = new Set();
    data.forEach((item) => uniqName.add(item[0]));
    return Array.from(uniqName);
  };

  // Function to get data for each name for the given date range
  const getDataForDateRange = (names, data, startDate, endDate) => {
    const result = [];
    names.forEach((name) => {
      const nameData = data.filter((item) => item[0] === name);
      const nameDataMap = new Map(nameData.map((item) => [item[1], item[2]]));
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().slice(0, 10);
        const value = nameDataMap.has(dateString)
          ? nameDataMap.get(dateString)
          : 0;
        result.push([name, dateString, value]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return result;
  };

  const onHide = () => {
    setVisible(false);
  };

  const applySelections = async (e) => {
    op.current.toggle(e);

    if (dateRange.startDate == null || dateRange.endDate == null) {
      //console.log('please select date');

      show();
    } else {
      const data1 = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        queues: selectedQueue ? selectedQueue : [],
        marketSector: selectedMarketSector ? selectedMarketSector : [],
        participantType: selectedParticipant ? selectedParticipant : [],
        lob: selectedLOB ? selectedLOB : [],
        ClientID: selectedClientID ? selectedClientID : [],
        DNIS: selectedDNIS ? selectedDNIS : [],
      };

      // console.log(selectedTopics.length, 'length of selectedTopics')

      if (selectedTopics.length >= 1) {
        // const highestTopicNamesResponse = await getTopTopics(data1);
        // console.log(highestTopicNamesResponse, 'highestTopicNames');

        // let highestTopicNames = highestTopicNamesResponse.rows;
        dispatch(setSelectedTopics(selectedTopics));

        const topicInOrderResponse = await getSelectedTopicsInOrder({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          queues: selectedQueue ? selectedQueue : [],
          marketSector: selectedMarketSector ? selectedMarketSector : [],
          participantType: selectedParticipant ? selectedParticipant : [],
          lob: selectedLOB ? selectedLOB : [],
          ClientID: selectedClientID ? selectedClientID : [],
          DNIS: selectedDNIS ? selectedDNIS : [],
          selectedTopics: selectedTopics ? selectedTopics : [],
        });

        //console.log(topicInOrderResponse.rows, 'selected topic in order');

        const topicsInDescentingOrder = topicInOrderResponse.rows;
        const uniqName = topicsInDescentingOrder.map((item) => item[0]);

        let resArray = [];

        // for (const k of highestTopicNames) {
        for (const k of topicsInDescentingOrder) {
          getTopics({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            queues: selectedQueue ? selectedQueue : [],
            marketSector: selectedMarketSector ? selectedMarketSector : [],
            participantType: selectedParticipant ? selectedParticipant : [],
            lob: selectedLOB ? selectedLOB : [],
            ClientID: selectedClientID ? selectedClientID : [],
            DNIS: selectedDNIS ? selectedDNIS : [],
            topicName: k[0],
          }).then((response) => {
            //console.log('API New Res', response);
            let x = [response.rows].flat();
            //console.log('....xxxxxxx', ...x, x);

            // setResponseArray(prevData => [...prevData, ...x]);
            resArray.push(...x);
            //console.log(response, 'API response1234 Use effect', x, responseArray, k[0])

            const stDate = new Date(dateRange.startDate);
            const edDate = new Date(dateRange.endDate);

            // const uniqName = getUniqniqueNames(resArray);
            const result = getDataForDateRange(
              uniqName,
              resArray,
              stDate,
              edDate
            );

            //console.log('useEffect historical prem', result, uniqName)

            let fetchData = createGraphData(result);
            //console.log(fetchData, 'historical fetchData')

            dispatch(setFetchedData(fetchData));
            dispatch(setOriginalFetchedData(resArray));
            dispatch(
              setFilters({
                queues: selectedQueue ? selectedQueue : [],
                marketSector: selectedMarketSector ? selectedMarketSector : [],
                participantType: selectedParticipant ? selectedParticipant : [],
                lob: selectedLOB ? selectedLOB : [],
                ClientID: selectedClientID ? selectedClientID : [],
                DNIS: selectedDNIS ? selectedDNIS : [],
              })
            );
          });
        }

        await insertUserInfo({
          UserName: fetchedUserName.userName,
          loginDate: new Date(),
          activityData: {
            dateRange: dateRange,
            filter: {
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
              selectedTopics: selectedTopics ? selectedTopics : [],
            },
            currentDate: null,
            currentTopic: null,
            topicCount: null,
            phrasesCount: null,
            topicDownload: {
              buttonClick: false,
              topicSelected: null,
            },
            phraseDownload: {
              buttonClick: false,
              phrasesSelected: null,
            },
          },
        });
      } else {
        //console.log('inside else part')

        const highestTopicNamesResponse = await getTopTopics(data1);
        //console.log(highestTopicNamesResponse, 'highestTopicNames Use effect');

        let highestTopicNames = highestTopicNamesResponse.rows;

        const transformedAlltopics = highestTopicNames.map((item) => {
          return { name: item[0] };
        });

        const uniqName = highestTopicNames.map((item) => item[0]);

        setSelectedTopic(transformedAlltopics);
        dispatch(setSelectedTopics(transformedAlltopics));

        setResponseArray([]);
        let resArray = [];

        highestTopicNames.map((k) => {
          getTopics({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            queues: selectedQueue ? selectedQueue : [],
            marketSector: selectedMarketSector ? selectedMarketSector : [],
            participantType: selectedParticipant ? selectedParticipant : [],
            lob: selectedLOB ? selectedLOB : [],
            ClientID: selectedClientID ? selectedClientID : [],
            DNIS: selectedDNIS ? selectedDNIS : [],
            topicName: k[0],
          }).then((response) => {
            //console.log('API New Res', response);
            let x = [response.rows].flat();
            // console.log('....xxxxxxx', ...x, x);

            // setResponseArray(prevData => [...prevData, ...x]);
            resArray.push(...x);
            //console.log(response, 'API response1234 Use effect', x, responseArray, k[0])

            const stDate = new Date(dateRange.startDate);
            const edDate = new Date(dateRange.endDate);

            // const uniqName = getUniqniqueNames(resArray);
            const result = getDataForDateRange(
              uniqName,
              resArray,
              stDate,
              edDate
            );

            //console.log('useEffect historical prem', result, uniqName)

            let fetchData = createGraphData(result);
            //console.log(fetchData, 'historical fetchData')

            dispatch(setFetchedData(fetchData));
            dispatch(setOriginalFetchedData(resArray));
            dispatch(
              setFilters({
                queues: selectedQueue ? selectedQueue : [],
                marketSector: selectedMarketSector ? selectedMarketSector : [],
                participantType: selectedParticipant ? selectedParticipant : [],
                lob: selectedLOB ? selectedLOB : [],
                ClientID: selectedClientID ? selectedClientID : [],
                DNIS: selectedDNIS ? selectedDNIS : [],
              })
            );
          });
        });
        await insertUserInfo({
          UserName: fetchedUserName.userName,
          //loginDate: new Date(),
          activityData: {
            dateRange: dateRange,
            filter: {
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
              selectedTopics: "default Top 25 Topics",
            },
            currentDate: null,
            currentTopic: null,
            topicCount: null,
            phrasesCount: null,
            topicDownload: {
              buttonClick: false,
              topicSelected: null,
            },
            phraseDownload: {
              buttonClick: false,
              phrasesSelected: null,
            },
          },
        });
      }

      const responseAllTopics = await getAllTopics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      //console.log(responseAllTopics, 'ALL TOPICS')

      let allTopicsData = responseAllTopics.rows;

      const transformedArray = allTopicsData.map((item) => {
        return { name: item[0] };
      });

      setAllTopics(transformedArray);
      // storing in redux
    }
  };

  const applySelectionsWithout = async () => {
    const data1 = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      queues: selectedQueue ? selectedQueue : [],
      marketSector: selectedMarketSector ? selectedMarketSector : [],
      participantType: selectedParticipant ? selectedParticipant : [],
      lob: selectedLOB ? selectedLOB : [],
      ClientID: selectedClientID ? selectedClientID : [],
      DNIS: selectedDNIS ? selectedDNIS : [],
    };

    if (selectedTopics.length > 0) {
      const topicInOrderResponse = await getSelectedTopicsInOrder({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        queues: selectedQueue ? selectedQueue : [],
        marketSector: selectedMarketSector ? selectedMarketSector : [],
        participantType: selectedParticipant ? selectedParticipant : [],
        lob: selectedLOB ? selectedLOB : [],
        ClientID: selectedClientID ? selectedClientID : [],
        DNIS: selectedDNIS ? selectedDNIS : [],
        selectedTopics: selectedTopics ? selectedTopics : [],
      });

      //console.log(topicInOrderResponse.rows, 'selected topic in order');

      const topicsInDescentingOrder = topicInOrderResponse.rows;
      const uniqName = topicsInDescentingOrder.map((item) => item[0]);

      let resArray = [];

      selectedTopics.map((k) => {
        getTopics({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          queues: selectedQueue ? selectedQueue : [],
          marketSector: selectedMarketSector ? selectedMarketSector : [],
          participantType: selectedParticipant ? selectedParticipant : [],
          lob: selectedLOB ? selectedLOB : [],
          ClientID: selectedClientID ? selectedClientID : [],
          DNIS: selectedDNIS ? selectedDNIS : [],
          topicName: k.name,
        }).then((response) => {
          //console.log('API New Res', response);
          let x = [response.rows].flat();
          //console.log('....xxxxxxx', ...x, x);

          // setResponseArray(prevData => [...prevData, ...x]);
          resArray.push(...x);
          //console.log(response, 'API response1234 Use effect', x, responseArray, k[0])

          const stDate = new Date(dateRange.startDate);
          const edDate = new Date(dateRange.endDate);

          // const uniqName = getUniqniqueNames(resArray);
          const result = getDataForDateRange(
            uniqName,
            resArray,
            stDate,
            edDate
          );

          //console.log('useEffect historical prem', result, uniqName)

          let fetchData = createGraphData(result);
          //console.log(fetchData, 'historical fetchData')

          dispatch(setFetchedData(fetchData));
          dispatch(setOriginalFetchedData(resArray));
          dispatch(
            setFilters({
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
            })
          );
        });
      });

      if (fetchedUserName.userName != null) {
        await insertUserInfo({
          UserName: fetchedUserName.userName,
          loginDate: new Date(),
          activityData: {
            dateRange: dateRange,
            filter: {
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
              selectedTopics: selectedTopics ? selectedTopics : [],
            },
            currentDate: null,
            currentTopic: null,
            topicCount: null,
            phrasesCount: null,
            topicDownload: {
              buttonClick: false,
              topicSelected: null,
            },
            phraseDownload: {
              buttonClick: false,
              phrasesSelected: null,
            },
          },
        });
      }
    } else {
      const highestTopicNamesResponse = await getTopTopics(data1);

      let highestTopicNames = highestTopicNamesResponse.rows;

      const transformedAlltopics = highestTopicNames.map((item) => {
        return { name: item[0] };
      });

      const uniqName = highestTopicNames.map((item) => item[0]);

      setSelectedTopic(transformedAlltopics);
      dispatch(setSelectedTopics(transformedAlltopics));

      setResponseArray([]);
      let resArray = [];

      highestTopicNames.map((k) => {
        getTopics({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          queues: selectedQueue ? selectedQueue : [],
          marketSector: selectedMarketSector ? selectedMarketSector : [],
          participantType: selectedParticipant ? selectedParticipant : [],
          lob: selectedLOB ? selectedLOB : [],
          ClientID: selectedClientID ? selectedClientID : [],
          DNIS: selectedDNIS ? selectedDNIS : [],
          topicName: k[0],
        }).then((response) => {
          console.log("API New Res", response);
          let x = [response.rows].flat();
          console.log("....xxxxxxx", ...x, x);

          // setResponseArray(prevData => [...prevData, ...x]);
          resArray.push(...x);
          //console.log(response, 'API response1234 Use effect', x, responseArray, k[0])

          const stDate = new Date(dateRange.startDate);
          const edDate = new Date(dateRange.endDate);

          // const uniqName = getUniqniqueNames(resArray);
          const result = getDataForDateRange(
            uniqName,
            resArray,
            stDate,
            edDate
          );

          console.log("useEffect historical prem", result, uniqName);

          let fetchData = createGraphData(result);
          console.log(fetchData, "historical fetchData");

          dispatch(setFetchedData(fetchData));
          dispatch(setOriginalFetchedData(resArray));
          dispatch(
            setFilters({
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
            })
          );
        });
      });
      if (fetchedUserName.userName != null) {
        await insertUserInfo({
          UserName: fetchedUserName.userName,
          loginDate: new Date(),
          activityData: {
            dateRange: dateRange,
            filter: {
              queues: selectedQueue ? selectedQueue : [],
              marketSector: selectedMarketSector ? selectedMarketSector : [],
              participantType: selectedParticipant ? selectedParticipant : [],
              lob: selectedLOB ? selectedLOB : [],
              ClientID: selectedClientID ? selectedClientID : [],
              DNIS: selectedDNIS ? selectedDNIS : [],
              selectedTopics: "default Top 25 Topics",
            },
            currentDate: null,
            currentTopic: null,
            topicCount: null,
            phrasesCount: null,
            topicDownload: {
              buttonClick: false,
              topicSelected: null,
            },
            phraseDownload: {
              buttonClick: false,
              phrasesSelected: null,
            },
          },
        });
      }
    }

    const responseAllTopics = await getAllTopics({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    console.log(responseAllTopics, "ALL TOPICS");

    let allTopicsData = responseAllTopics.rows;

    const transformedArray = allTopicsData.map((item) => {
      return { name: item[0] };
    });

    setAllTopics(transformedArray);

    // fetch available LOBS on selected daterange
    const responseLOb = await getLOB({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    let fetchedLOB = responseLOb.rows;

    const transformedLOB = fetchedLOB.map((item) => {
      return { name: item[0] };
    });
    setLOB(transformedLOB);

    const responseMT = await getMarketType({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    let fetchedMT = responseMT.rows;

    const transformedMT = fetchedMT.map((item) => {
      return { name: item[0] };
    });

    setMarketSector(transformedMT);
  };
  const documentStyle = getComputedStyle(document.documentElement);

  // console.log(fetchedData, 'fetched data from rfdux')
  const createGraphData = (result) => {
    console.log("inside createGraph Data", result);
    // const lightColors = [
    //     "#fbbf24","#f97316", "#f43f5e", "#e879f9", "#c026d3","#86198f",
    // "#9AC1A6","#9ca3af","#ea580c", "#d97706","#ec4899", "#f9a8d4",
    // "#6b7280","#a5f3fc","#4a044e","#db2777","#fbcfe8","#f5d0fe",
    // "#fef08a","#22d3ee", "#818cf8","#3f3f46","#0d9488","#fafafa"

    //  ];

    const lightColors = [
      "#ff9442",
      "#F8BBD0",
      "#AB47BC",
      "#E1BEE7",
      "#880E4F",
      "#EF6C00",
      "#388E3C",
      "#D0845B",
      "#F9A825",
      "#33691E",
      "#827717",
      "#00ACC1",
      "#90CAF9",
      "#FFC107",
      "#C5CAE9",
      "#000000",
      "#B39DDB",
      "#FFCC80",
      "#455A64",
      "#B0BEC5",
      "#d93d90",
      "#8DAED5",
      "#5b8591",
      "#455A6",
      "#59178c",
    ];

    let graphData = {
      labels: [],
      datasets: [],
    };
    let i = 0;

    result.forEach((row, index) => {
      const topicname = row[0];
      const date = formatDate(row[1]);
      const count = row[2];

      const topicIndex = graphData.datasets.findIndex(
        (dataset) => dataset.label == topicname
      );
      // console.log(topicIndex,'tpindex', graphData,'gdata', topicname)

      if (topicIndex == -1) {
        graphData.datasets.push({
          label: topicname,
          data: [count],
          fill: false,
          borderColor: lightColors[i],
          tension: 0.4,
          borderWidth: 4,
        });
        console.log(
          lightColors[i],
          "color",
          i,
          index,
          "----",
          lightColors[index]
        );
        ++i;
      } else {
        // graphData.datasets[topicname].data.push(count);

        if (!graphData.datasets[topicIndex].data) {
          graphData.datasets[topicIndex].data = [];
        }
        graphData.datasets[topicIndex].data.push(count);
      }
      if (!graphData.labels.includes(date)) {
        graphData.labels.push(date);
      }
    });
    // console.log(graphData, 'graphdata');
    return graphData;
  };

  const callF = async () => {
    await applySelectionsWithout();
    // const responseAllTopics = await getAllTopics();
    // console.log(responseAllTopics, 'ALL TOPICS')
  };

  useEffect(
    () => {
      callF();
    },
    [dateRange],
    [fetchedFilters]
  );

  const fetchQueues = async () => {
    const responseQueue = await getQueue({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB,
      marketSector: selectedMarketSector,
    });
    let fetchedQueue = responseQueue.rows;

    const transformedQueue = fetchedQueue.map((item) => {
      return { name: item[0] };
    });
    setQueues(transformedQueue);
 
    const responseClientID = await getClientId({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB,
      marketSector: selectedMarketSector,
    });
    let fetchedClientId = responseClientID.rows;

    const transformedClientId = fetchedClientId.map((item) => {
      return { name: item[0] };
    });
    setClientId(transformedClientId);
    //console.log(transformedClientId, 'transformedClientIds')

    // dnis
    const responseDnis = await getDnis({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB,
      marketSector: selectedMarketSector,
    });
    let fetchedDnis = responseDnis.rows;

    const transformedDnis = fetchedDnis.map((item) => {
      return { name: item[0] };
    });
    setDnis(transformedDnis);
    // console.log(transformedDnis, 'transformedDnis')

    // participant
    const responseParticipant = await getParticipantType({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB,
      marketSector: selectedMarketSector,
    });
    let fetchedParticipant = responseParticipant.rows;

    const transformedParticipant = fetchedParticipant.map((item) => {
      return { name: item[0] };
    });
    setParticipant(transformedParticipant);
    //console.log(transformedParticipant, 'transformedParticipant')
  };

  useEffect(() => {
    setSelectedQueue([]);
    setSelectedClientID([]);
    setSelectedDNIS([]);
    setSelectedParticipant([]);
    fetchQueues();
  }, [selectedLOB, selectedMarketSector]);

  return (
    <div className="card flex flex-column align-items-center w-sm">
      <Toast ref={toast} />
      <Button
        type="button"
        icon="pi pi-filter-fill"
        onClick={(e) => op.current.toggle(e)}
      />

      <OverlayPanel
        ref={op}
        showCloseIcon={false}
        ariaCloseLabel="false"
        closeOnEscape
        dismissable={false}
        className="mr-5"
      >
        <div className="flex justify-end pb-1 ">
          <Button type="button" onClick={(e) => op.current.toggle(e)}>
            Close
          </Button>
        </div>
        <MultiSelect
          value={selectedLOB}
          onChange={(e) => setSelectedLOB((prevState) => e.value)}
          options={LOB}
          optionLabel="name"
          filter
          placeholder="LOB"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
          // disabled
        />
        <br />

        <MultiSelect
          value={selectedMarketSector}
          onChange={(e) => setSelectedMarketSector((prevState) => e.value)}
          options={marketSector}
          optionLabel="name"
          filter
          placeholder="Market Sector"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
        />
        <br />
        <MultiSelect
          value={selectedQueue}
          onChange={(e) => setSelectedQueue((prevState) => e.value)}
          options={queues}
          optionLabel="name"
          filter
          placeholder="Device Type"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
        />
        <br />
        <MultiSelect
          value={selectedParticipant}
          onChange={(e) => setSelectedParticipant((prevState) => e.value)}
          options={participant}
          optionLabel="name"
          filter
          placeholder="Interaction Reason"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
        />

        <div className="w-full flex justify-between">
          <Button
            label="Clear"
            onClick={clearSelections}
            className="p-button-primary bg-fuchsia-950 ml-5 mt-3 text-white"
            style={{ width: "100px", height: "35px" }}
          />

          <Button
            label="Apply"
            onClick={applySelections}
            className="w-80 p-button-primary bg-fuchsia-700 mr-5 mt-3 text-white"
            style={{ width: "100px" }}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};

const mapStateToProps = (state) => ({
  dateRange: state.dateRange,
});

export default connect(mapStateToProps)(PopupDoc);
