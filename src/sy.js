import React, { useState, useEffect } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { useDispatch, useSelector } from "react-redux";
import { Delete as DeleteIcon } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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

const CategoriesReporting = (props) => {
  const {
    trendData,
    dailyData,
    cardData,
    setCardData,
    interactionsTrendData,
    ACDTrendData,
    customerTrendData,
    agentTrendData,
    silenceTrendData,
    IVRTrendData,
    othersTrendData,
    overtalkTrendData,
    selectedACDTime,
    setSelectedACDTime,
    selectedCustomerTime,
    setSelectedCustomerTime,
    selectedAgentTime,
    setSelectedAgentTime,
    selectedSilenceTime,
    setSelectedSilenceTime,
    selectedIVRTime,
    setSelectedIVRTime,
    selectedOthersTime,
    setSelectedOthersTime,
    selectedOvertalkCount,
    setSelectedOvertalkCount,
    resetTime
  } = props;

  const [tempValue, setTempValue] = useState([20, 50]);
  const [finalValue, setFinalValue] = useState([20, 50]);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(0);

  const [ACDTimeRange, setACDTimeRange] = useState([0, 100]);
  const [customerTimeRange, setCustomerTimeRange] = useState([0, 100]);
  const [agentTimeRange, setAgentTimeRange] = useState([0, 100]);
  const [silenceTimeRange, setSilenceTimeRange] = useState([0, 100]);
  const [IVRTimeRange, setIVRTimeRange] = useState([0, 100]);
  const [othersTimeRange, setOthersTimeRange] = useState([0, 100]);
  const [overtalkRange, setOvertalkRange] = useState([0, 500]);

  // const [selectedagentTime,setSelectedAgentTime]=useState([20, 50]);
  // const [selectedcustomerTime,setSelectedCustomerTime]=useState([20, 50]);
  // const [selectedQueueTime,setSelectedQueueTime]=useState([20, 50]);
  // const [selectedIVRTime,setSelectedIVRTime]=useState([20, 50]);
  // const [selectedothersTime,setSelectedOthersTime]=useState([20, 50]);
  // const [selectedovertalk,setSelectedOvertalk]=useState([20, 50]);

  const [cards, setCards] = useState([
    {
      category: "Total Interactions",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: false,
      hasReset: true,
    },
    {
      category: "Silence Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: silenceTimeRange,
      rangeSelect: setSilenceTimeRange,
      rangeConfirm: setSelectedSilenceTime,
    },
    {
      category: "Agent Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: agentTimeRange,
      rangeSelect: setAgentTimeRange,
      rangeConfirm: setSelectedAgentTime,
    },
    {
      category: "Customer Talk Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: customerTimeRange,
      rangeSelect: setCustomerTimeRange,
      rangeConfirm: setSelectedCustomerTime,
    },
    {
      category: "Queue Wait Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: ACDTimeRange,
      rangeSelect: setACDTimeRange,
      rangeConfirm: setSelectedACDTime,
    },
    {
      category: "IVR Time",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: IVRTimeRange,
      rangeSelect: setIVRTimeRange,
      rangeConfirm: setSelectedIVRTime,
    },
    {
      category: "Others",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: othersTimeRange,
      rangeSelect: setOthersTimeRange,
      rangeConfirm: setSelectedOthersTime,
    },
    {
      category: "Overtalk Count",
      isRemovable: false,
      description: `This card shows total count of feedback in last ${period} days.`,
      hasRange: true,
      rangeValue: overtalkRange,
      rangeSelect: setOvertalkRange,
      rangeConfirm: setSelectedOvertalkCount,
    },
  ]);

  useEffect(() => {
    setACDTimeRange([selectedACDTime.from, selectedACDTime.to]);
  }, [selectedACDTime]);
  useEffect(() => {
    setCustomerTimeRange([selectedCustomerTime.from, selectedCustomerTime.to]);
  }, [selectedCustomerTime]);
  useEffect(() => {
    setAgentTimeRange([selectedAgentTime.from, selectedAgentTime.to]);
  }, [selectedAgentTime]);
  useEffect(() => {
    setSilenceTimeRange([selectedSilenceTime.from, selectedSilenceTime.to]);
  }, [selectedSilenceTime]);
  useEffect(() => {
    setIVRTimeRange([selectedIVRTime.from, selectedIVRTime.to]);
  }, [selectedIVRTime]);
  useEffect(() => {
    setOthersTimeRange([selectedOthersTime.from, selectedOthersTime.to]);
  }, [selectedOthersTime]);
  useEffect(() => {
    setOvertalkRange([selectedOvertalkCount.from, selectedOvertalkCount.to]);
  }, [selectedOvertalkCount]);
  // Update cardData only when trendData and dailyData are available
  useEffect(() => {
    //console.log(Object.keys(dailyData).length)
    if (
      Object.keys(trendData).length !== 0 &&
      Object.keys(dailyData).length !== 0
    ) {
      //console.log("Setting card data with trendData and dailyData",Object.keys(trendData).length)
      setSilenceTimeRange([selectedSilenceTime.from, selectedSilenceTime.to]);
      setCardData({
        "Total Interactions": {
          value: interactionsTrendData.currentPeriod?.interactions || 0,
          trend: interactionsTrendData.percentChanges?.interactions || 0,
          data: dailyData.interactionsArray || [],
        },
        "Queue Wait Time": {
          value: ACDTrendData.currentPeriod?.interactions || 0,
          trend: ACDTrendData.percentChanges?.interactions || 0,
          data: dailyData.NFRArray || [],
        },

        "Agent Talk Time": {
          value: agentTrendData.currentPeriod?.interactions || 0,
          trend: agentTrendData.percentChanges?.interactions || 0,
          data: dailyData.negativeFeedbackArray || [],
        },
        "Customer Talk Time": {
          value: customerTrendData.currentPeriod?.interactions || 0,
          trend: customerTrendData.percentChanges?.interactions || 0,
          data: dailyData.PFRArray || [],
        },
        "Silence Time": {
          value: silenceTrendData.currentPeriod?.interactions || 0,
          trend: silenceTrendData.percentChanges?.interactions || 0,
          data: dailyData.positiveFeedbackArray || [],
        },
        "IVR Time": {
          value: IVRTrendData?.currentPeriod?.interactions || 0,
          trend: IVRTrendData?.percentChanges?.interactions || 0,
          data: dailyData.positiveFeedbackArray || [],
        },
        Others: {
          value: othersTrendData?.currentPeriod?.interactions || 0,
          trend: othersTrendData?.percentChanges?.interactions || 0,
          data: dailyData.negativeFeedbackArray || [],
        },
        "Overtalk Count": {
          value: overtalkTrendData?.currentPeriod?.interactions || 0,
          trend: overtalkTrendData?.percentChanges?.interactions || 0,
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
          hasRange: false,
          hasReset: true,
        },
        {
          category: "Queue Wait Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: ACDTimeRange,
          rangeSelect: setACDTimeRange,
          rangeConfirm: setSelectedACDTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Customer Talk Time",
          isRemovable: false,
          description: `This card shows the % of total positive feedback with respect to negative feedback (${trendData.currentPeriod.pfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: customerTimeRange,
          rangeSelect: setCustomerTimeRange,
          rangeConfirm: setSelectedCustomerTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Agent Talk Time",
          isRemovable: false,
          description: `This card shows total count of negative feedback (${trendData.currentPeriod.negative}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: agentTimeRange,
          rangeSelect: setAgentTimeRange,
          rangeConfirm: setSelectedAgentTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Silence Time",
          isRemovable: false,
          description: `This card shows total count of positive feedback (${trendData.currentPeriod.positive}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: silenceTimeRange,
          rangeSelect: setSilenceTimeRange,
          rangeConfirm: setSelectedSilenceTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "IVR Time",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: IVRTimeRange,
          rangeSelect: setIVRTimeRange,
          rangeConfirm: setSelectedIVRTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Others",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: othersTimeRange,
          rangeSelect: setOthersTimeRange,
          rangeConfirm: setSelectedOthersTime,
          step: 1,
          min: 0,
          max: 100,
        },
        {
          category: "Overtalk Count",
          isRemovable: false,
          description: `This card shows the % of total negative feedback with respect to positve feedback (${trendData.currentPeriod.nfrcurr}) for ${dailyData.timePeriod.length} days.`,
          hasRange: true,
          rangeValue: overtalkRange,
          rangeSelect: setOvertalkRange,
          rangeConfirm: setSelectedOvertalkCount,
          step: 10,
          min: 0,
          max: 500,
        },
      ]);
      setLoading(false);
    }
  }, [cardData]);

  const handleChange = (event, newValue, index) => {
    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i == index ? { ...card, rangeValue: newValue } : card
      )
    );
  };

  const handleConfirm = (index) => {
    console.log(cards[index]);

    cards[index].rangeConfirm({
      from: cards[index].rangeValue[0],
      to: cards[index].rangeValue[1],
    });
  };

  const hadleReset = () => {
    setACDTimeRange([0, 100]);
  setCustomerTimeRange([0, 100]);
  setAgentTimeRange([0, 100]);
  setSilenceTimeRange([0, 100]);
  setIVRTimeRange([0, 100]);
  setOthersTimeRange([0, 100]);
  setOvertalkRange([0, 500]);

  resetTime({from:0,to:100});
  }
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
                  ? category == "Total Interactions"
                    ? "up"
                    : "down"
                  : category == "Total Interactions"
                  ? "down"
                  : "up";
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
                    {card.hasRange ? (
                      <div className="flex flex-row justify-between">
                        <Slider
                          value={card.rangeValue}
                          onChange={(event, newValue) =>
                            handleChange(event, newValue, index)
                          }
                          valueLabelDisplay="auto"
                          defaultValue={0}
                          min={card.min}
                          step={card.step}
                          max={card.max}
                        />
                        <IconButton
                          sx={{ padding: 0, margin: "0 0 0 8px" }}
                          onClick={() => handleConfirm(index)}
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
                      </div>
                    ) : (
                      ""
                    )}

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
                          {card.hasRange ? (
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
                          ) : (
                            ""
                          )}
                          {card.hasReset ? (
                            <IconButton
                              sx={{ padding: 0, margin: 0 }}
                              size="small"
                              onClick={hadleReset}
                            >
                              <RestartAltIcon
                                sx={{
                                  color: "#fff",
                                  backgroudColour: "#000",
                                  borderRadius: "50%",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          ) : (
                            ""
                          )}
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
                              showHighlight
                              showTooltip
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
