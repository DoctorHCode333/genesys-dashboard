import React, { useState } from "react";
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

const mockCategories = ["Positive Feedback", "Negative Feedback"];

const mockData = {
  "Positive Feedback": {
    value: "1.3K",
    trend: "up",
    color: "#00FF00",
    data: [2030, 5550, 615, 870, 560, 100, 1200],
  },
  Interactions: {
    value: "8K",
    trend: "upo",
    color: "#991350",
    data: [200, 180, 170, 155, 140, 160, 150],
  },
  "Negative Feedback": {
    value: 420,
    trend: "down",
    color: "#991350",
    data: [42, 21, 20, 83, 19, 18, 20],
  },
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
  const [cards, setCards] = useState([
    { category: "Interactions", isRemovable: false },
    { category: "Positive Feedback", isRemovable: false },
    { category: "Negative Feedback", isRemovable: false },
  ]);

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

            // Custom chart color based on trend
            const chartColor =
              trend === "up"
                ? "#00FF00" // Green for positive trend
                : trend === "down"
                ? "#991350" // Custom color for negative trend
                : "#999999"; // Default color for neutral

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
                          onClick={() => setCards(cards.filter((_, i) => i !== index))}
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
                                color={
                                  trend === "up"
                                    ? "success"
                                    : trend === "down"
                                    ? "error"
                                    : "default"
                                }
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
                            colors={[chartColor]} // Custom color for chart line
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



//////////////////////////////////////////////////////////////////
export const fetchDataActions = async () => {
  try {
    let opts = { 
      "pageSize": 2, // Number | The total page size requested
       "pageNumber": 1, // Number | The page number requested
      // "nextPage": "nextPage_example", // String | next page token
      // "previousPage": "previousPage_example", // String | Previous page token
      // "sortBy": "sortBy_example", // String | Root level field name to sort on.
      // "sortOrder": "asc", // String | Direction to sort 'sortBy' field.
      // "category": "category_example", // String | Filter by category name.
      // "name": "name_example", // String | Filter by partial or complete action name.
      // "ids": "ids_example", // String | Filter by action Id. Can be a comma separated list to request multiple actions.  Limit of 50 Ids.
      // "secure": "secure_example", // String | Filter based on 'secure' configuration option. True will only return actions marked as secure. False will return only non-secure actions. Do not use filter if you want all Actions.
      // "includeAuthActions": "false" // String | Whether or not to include authentication actions in the response. These actions are not directly executable. Some integrations create them and will run them as needed to refresh authentication information for other actions.
    };
    const data = await IntegrationsApi.getIntegrationsActions(opts);
    console.log("Data Actions",data);
    
    if (data && data.entities) {
      const rows = data.entities.map(async (user) => ({
        id:user.id||"N/A",
        url:(
          let opts = { 
            "expand": "expand_example", // String | Indicates a field in the response which should be expanded.
            "includeConfig": true // Boolean | Return config in response.
          };
          
          // Retrieves a single Action matching id.
          const resp = await IntegrationsApi.getIntegrationsAction(user.id, opts)
          console.log(resp.config.request.requestUrlTemplate);
          return resp.config.request.requestUrlTemplate;
          
        }
      }))
      const columns = [
        { field: "id", headerName: "ID", width: 300 },
        { field: "name", headerName: "Username", width: 300 },
      ];

      const transformedUserData = {
        rows,
        columns,
      };
      console.log(transformedUserData);
      return transformedUserData;
    } else {
      return [];
    }
  } catch (err) {
    console.log("There was a failure calling Integrations Api", err);
  }
};

import React from "react";
import * as XLSX from "xlsx";

const data = [
  { id: 1, name: "John Doe", age: 25 },
  { id: 2, name: "Jane Smith", age: 30 },
  { id: 3, name: "Mark Johnson", age: 22 },
];

const ExportExcel = () => {
  const exportToExcel = () => {
    // 1. Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 3. Trigger download of the Excel file
    XLSX.writeFile(workbook, "UserData.xlsx");
  };

  return (
    <div>
      <button onClick={exportToExcel}>Download Excel</button>
    </div>
  );
};

export default ExportExcel;

