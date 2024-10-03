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
import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";
import { useDispatch } from "react-redux";
//import { setFetchedData, setFilters } from "../Redux/actions";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./custom-style.css";

const PopupDoc = (props) => {

  const toast = useRef(null);
  const op = useRef(null);

  const { globalFilters, filters, dateRange , setFilters} = props
  
  const [selectedLOB, setSelectedLOB] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState([]);
  const [selectedInteractionReason, setSelectedInteractionReason] = useState([]);

  const [LOB, setLOB] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [interactionReasons, setInteractionReasons] = useState([]);

  const dispatch = useDispatch();

  // Load the global filter options (i.e., what will be shown in dropdowns)
  useEffect(() => {
    if (globalFilters && globalFilters.lob.length > 0) {
        console.log("INside", globalFilters.lob.length);
        
      setLOB(globalFilters.lob.map((array)=>array[0]) || []); // Safely handle empty globalFilters
      setDeviceTypes(globalFilters.deviceType.map((array)=>array[0]) || []);
      setInteractionReasons(globalFilters.interactionReason.map((array)=>array[0]) || []);
    } else {
      // Handle empty globalFilters by setting dropdown options to empty
      setLOB([]);
      setDeviceTypes([]);
      setInteractionReasons([]);
    }
  }, [globalFilters]);

  // Function to clear all user-selected filter selections
  const clearSelections = () => {
    setSelectedLOB([]);
    setSelectedDeviceType([]);
    setSelectedInteractionReason([]);

    // Reset filters state to empty arrays
    dispatch(
      setFilters({
        lob: [],
        deviceType: [],
        interactionReason: [],
      })
    );
  };

  // Function to apply user-selected filters and update Redux state
  const applySelections = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      // Show error if date range is not selected
      toast.current.show({
        severity: "error",
        summary: "Invalid Date Range",
        detail: "Please select a valid date range",
      });
      return;
    }

    const filterData = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB.length > 0 ? selectedLOB : [],
      deviceType: selectedDeviceType.length > 0 ? selectedDeviceType : [],
      interactionReason: selectedInteractionReason.length > 0 ? selectedInteractionReason : [],
    };

    // Dispatch the selected filters to the Redux store
    dispatch(setFilters(filterData));
    //dispatch(setFetchedData([])); // Replace with the actual fetched data based on applied filters
  };

  // When user manually opens/closes the panel
  const onOverlayToggle = (e) => {
    op.current.toggle(e);
  };
if(LOB.length>0 || deviceTypes.length>0 || interactionReasons.length>0){

    console.log(LOB,deviceTypes);
    
  return (
    <div className="card flex flex-column align-items-center w-sm">
      <Toast ref={toast} />
      <Button type="button" icon="pi pi-filter-fill" onClick={onOverlayToggle} />

      <OverlayPanel
        ref={op}
        showCloseIcon={false}
        ariaCloseLabel="false"
        closeOnEscape
        dismissable={false}
        className="mr-5"
      >
        <div className="flex justify-end pb-1">
          <Button type="button" onClick={onOverlayToggle}>
            Close
          </Button>
        </div>

        {/* LOB Filter */}
        <MultiSelect
          value={selectedLOB}
          onChange={(e) => setSelectedLOB(e.value)}
          options={LOB}
          optionLabel="name"
          filter
          placeholder="LOB"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1"
          showSelectAll={false}
          disabled={LOB.length === 0} // Disable if no options
        />
        <br />

        {/* Device Type Filter */}
        <MultiSelect
          value={selectedDeviceType}
          onChange={(e) => setSelectedDeviceType(e.value)}
          options={deviceTypes}
          optionLabel="name"
          filter
          placeholder="Device Type"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1"
          showSelectAll={false}
          disabled={deviceTypes.length === 0} // Disable if no options
        />
        <br />

        {/* Interaction Reason Filter */}
        <MultiSelect
          value={selectedInteractionReason}
          onChange={(e) => setSelectedInteractionReason(e.value)}
          options={interactionReasons}
          optionLabel="name"
          filter
          placeholder="Interaction Reason"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1"
          showSelectAll={false}
          disabled={interactionReasons.length === 0} // Disable if no options
        />

        <div className="w-full flex justify-between">
          {/* Clear Button */}
          <Button
            label="Clear"
            onClick={clearSelections}
            className="p-button-primary bg-fuchsia-950 ml-5 mt-3 text-white"
            style={{ width: "100px", height: "35px" }}
          />

          {/* Apply Button */}
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
}
export default PopupDoc;



