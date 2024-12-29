 import React, { useState, useEffect } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { useDispatch, useSelector } from "react-redux";
import { Delete as DeleteIcon } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import Slider from "@mui/material/Slider";
import { getBotFeedback, getBotFeedbackTrend } from "../API/TopicAPI";
import Loading from "./Loading";
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
  const { trendData, dailyData, cardData, setCardData } = props;
  const [tempValue, setTempValue] = useState([20, 50]);
  const [finalValue, setFinalValue] = useState([20, 50]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(0);
  
  const [silenceTimeRange,setSilenceTimeRange]=useState([20, 50]);
  const [agentTimeRange,setAgentTimeRange]=useState([20, 50]);
  const [customerTimeRange,setCustomerTimeRange]=useState([20, 50]);
  const [queueTimeRange,setQueueTimeRange]=useState([20, 50]);
  const [IVRTimeRange,setIVRTimeRange]=useState([20, 50]);
  const [othersTimeRange,setOthersTimeRange]=useState([20, 50]);
  const [overtalkRange,setOvertalkRange]=useState([20, 50]);

  const [selectedSilenceTime,setSelectedSilenceTime]=useState([20, 50]);
  const [selectedagentTime,setSelectedAgentTime]=useState([20, 50]);
  const [selectedcustomerTime,setSelectedCustomerTime]=useState([20, 50]);
  const [selectedQueueTime,setSelectedQueueTime]=useState([20, 50]);
  const [selectedIVRTime,setSelectedIVRTime]=useState([20, 50]);
  const [selectedothersTime,setSelectedOthersTime]=useState([20, 50]);
  const [selectedovertalk,setSelectedOvertalk]=useState([20, 50]);

  const [cards, setCards] = useState([
    {
      category: "Total Interactions",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:false,
      
    },
    {
      category: "Silence Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:silenceTimeRange,
      rangeSelect:setSilenceTimeRange,
      rangeConfirm:setSelectedSilenceTime,
    },
    {
      category: "Agent Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:agentTimeRange,
      rangeSelect:setAgentTimeRange,
      rangeConfirm:setSelectedAgentTime,
    },
    {
      category: "Customer Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:customerTimeRange,
      rangeSelect:setCustomerTimeRange,
      rangeConfirm:setSelectedCustomerTime,
    },
    {
      category: "Queue Wait Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:queueTimeRange,
      rangeSelect:setQueueTimeRange,
      rangeConfirm:setSelectedQueueTime,
    },
    {
      category: "IVR Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:IVRTimeRange,
      rangeSelect:setIVRTimeRange,
      rangeConfirm:setSelectedIVRTime,
    },
    {
      category: "Others",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:othersTimeRange,
      rangeSelect:setOthersTimeRange,
      rangeConfirm:setSelectedOthersTime,
    },
    {
      category: "Overtalk Count",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange:true,
      rangeValue:overtalkRange,
      rangeSelect:setOvertalkRange,
      rangeConfirm:setSelectedOvertalk,
    },
  ]);

  // Update cardData only when trendData and dailyData are available
  useEffect(() => {
    //console.log(Object.keys(dailyData).length)
    if (
      Object.keys(trendData).length !== 0 &&
      Object.keys(dailyData).length !== 0
    ) {
      //console.log("Setting card data with trendData and dailyData",Object.keys(trendData).length)
      setCardData({
        "Total Interactions": {
          value: trendData.currentPeriod?.interactions || 0,
          trend: trendData.percentChanges?.interactions || 0,
          data: dailyData.interactionsArray || [],
        },
        "Silence Time": {
          value: trendData.currentPeriod?.positive || 0,
          trend: trendData.percentChanges?.positive || 0,
          data: dailyData.positiveFeedbackArray || [],
        },
        "Agent Talk Time": {
          value: trendData.currentPeriod?.negative || 0,
          trend: trendData.percentChanges?.negative || 0,
          data: dailyData.negativeFeedbackArray || [],
        },
        "Customer Talk Time": {
          value: trendData.currentPeriod?.pfrcurr || 0,
          trend: trendData.percentChanges?.pfr || 0,
          data: dailyData.PFRArray || [],
        },
        "Queue Wait Time": {
          value: trendData.currentPeriod?.nfrcurr || 0,
          trend: trendData.percentChanges?.nfr || 0,
          data: dailyData.NFRArray || [],
        },
        "IVR Time": {
          value: trendData.currentPeriod?.positive || 0,
          trend: trendData.percentChanges?.positive || 0,
          data: dailyData.positiveFeedbackArray || [],
        },
        Others: {
          value: trendData.currentPeriod?.negative || 0,
          trend: trendData.percentChanges?.negative || 0,
          data: dailyData.negativeFeedbackArray || [],
        },
      });
      //setLoading(false); // Data is loaded, update loading state
    }
  }, [trendData, dailyData]);

  // Log cardData updates
  useEffect(() => {
    // console.log(Object.keys(cardData).length)
    if (Object.keys(cardData).length !== 0) {
      // console.log("Updated card data:", cardData);
      // console.log("Updated card data:", dailyData);
      setPeriod(dailyData.timePeriod.length);
      setCards([
        {
          category: "Total Interactions",
          isRemovable: false,
          description: `This card shows total count of feedback (${trendData.currentPeriod.interactions}) for ${dailyData.timePeriod.length} days.`,
          hasRange:false,
        },
        {
          category: "Silence Time",
          isRemovable: false,
          description: `This card shows total count of positive feedback (${trendData.currentPeriod.positive}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:silenceTimeRange,
          rangeSelect:setSilenceTimeRange,
          rangeConfirm:setSelectedSilenceTime,
        },
        {
          category: "Agent Talk Time",
          isRemovable: false,
          description: `This card shows total count of negative feedback (${trendData.currentPeriod.negative}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:agentTimeRange,
          rangeSelect:setAgentTimeRange,
          rangeConfirm:setSelectedAgentTime,
        },
        {
          category: "Customer Talk Time",
          isRemovable: false,
          description: `This card shows the % of total positive feedback with respect to negative feedback (${trendData.currentPeriod.pfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:customerTimeRange,
          rangeSelect:setCustomerTimeRange,
          rangeConfirm:setSelectedCustomerTime,
        },
        {
          category: "Queue Wait Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:queueTimeRange,
          rangeSelect:setQueueTimeRange,
          rangeConfirm:setSelectedQueueTime,
        },
        {
          category: "IVR Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:othersTimeRange,
          rangeSelect:setOthersTimeRange,
          rangeConfirm:setSelectedOthersTime,
        },
        {
          category: "Others",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange:true,
          rangeValue:overtalkRange,
          rangeSelect:setOvertalkRange,
          rangeConfirm:setSelectedOvertalk,
        },
      ]);
      setLoading(false);
    }
  }, [cardData]);

  const handleChange = (event, newValue) => {
    setTempValue(newValue);
  };

  const handleConfirm = (tempValue) => {
    setFinalValue(tempValue);
  };
  if (loading) {
    return (
      <div>
        {" "}
        <Loading />
      </div>
    );
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
            maxWidth: "90%",
            margin: "20px auto 30px",
          }}
        >
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ maxWidth: "110%" }}
          >
            {cards.map((card, index) => {
              const category = card.category;
              const trend =
                cardData[category].trend >= 0
                  ? category == "Negative Feedback" || category == "NFR"
                    ? "down"
                    : "up"
                  : category == "Negative Feedback" || category == "NFR"
                  ? "up"
                  : "down";
              const trendData = cardData[category].trend;
              const chartColor = trend === "up" ? "#00FF00" : "#991350"; // Green for positive, Purple for negative

              return (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={2.4}
                  lg={2.4}
                  xl={2.4}
                  key={index}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                   {card.hasRange?<div className="flex flex-row justify-between">
                      <Slider
                        value={card.rangeValue}
                        onChange={card.rangeSelect}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                      />
                      <IconButton
                        sx={{ padding: 0, margin: "0 0 0 8px" }}
                        onClick={card.rangeConfirm()}
                        size="small"
                      >
                        <CheckCircleOutlineIcon
                          sx={{
                            color: "#fff",
                            backgroudColour: "#000",
                            borderRadius: "50%",
                            fontSize: 20,
                          }}
                        />
                      </IconButton>
                    </div>:""} 

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
                            whiteSpace: "nowrap",
                            fontSize: "1rem",
                            color: "white",
                            fontFamily: "Optima, sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          {card.category}
                        </Typography>
                        <div className="flex flex-row justify-between">
                          <IconButton
                            sx={{ padding: 0, margin: 0 }}
                            size="small"
                          >
                            <AccessTimeIcon
                              sx={{
                                color: "#fff",
                                backgroudColour: "#000",
                                borderRadius: "50%",
                                fontSize: 20,
                              }}
                            />
                          </IconButton>

                          <Tooltip title={card.description}>
                            <IconButton
                              sx={{ padding: 0, margin: "0 0 0 8px" }}
                              size="small"
                            >
                              <InfoIcon
                                sx={{
                                  color: "#fff",
                                  backgroudColour: "#000",
                                  borderRadius: "50%",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </div>

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
                                {`${cardData[card.category]?.value}${
                                  card.category === "PFR" ||
                                  card.category === "NFR"
                                    ? "%"
                                    : ""
                                }` || 0}
                              </Typography>
                              <Tooltip
                                title={`There was a net ${Math.abs(
                                  cardData[card.category]?.trend || 0
                                ).toFixed(2)}% ${
                                  trendData > 0 ? "increase" : "decrease"
                                } in ${
                                  card.category
                                } in comparision to preceding ${period} days.`}
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
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: ".9rem",
                              }}
                            >
                              For {period} Days
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

