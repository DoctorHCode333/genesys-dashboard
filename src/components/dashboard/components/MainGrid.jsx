import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Stack from "@mui/material/Stack";
import ChartUserByCountry from "./ChartUserByCountry";
import CustomizedTreeView from "./CustomizedTreeView";
import CustomizedDataGrid from "./CustomizedDataGrid";
import HighlightedCard from "./HighlightedCard";
import PageViewsBarChart from "./PageViewsBarChart";
import PageViewsChart from "./PageViewsChart";
import StatCard from "./StatCard";
import TextField from "@mui/material/TextField";
import "../../../index.css";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import { Box } from '@mui/material';

const data = [
  {
    title: "Interactions",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [2, 4, 3, 5, 7, 6, 8, 10],
  },
  {
    title: "Categories",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [10, 7, 6, 8, 5, 4, 4, 2],
  },
  {
    title: "Engagements",
    value: "30k",
    interval: "Last 30 days",
    trend: "up",
    data: [2, 4, 3, 4, 5, 4, 7, 8],
  },
];

export default function MainGrid(props) {
  const { setQuery, query, userData, evalData } = props;
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <React.Fragment>
      {/* cards */}
      <Grid container spacing={2} columns={3}>
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 6, sm: 3, md: 2, lg: 2.25 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        {/* <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <HighlightedCard />
        </Grid> */}
      </Grid>
      <Grid
        container
        spacing={2}
        direction={{ xs: "row-reverse", md: "row" }}
        columns={12}
      >
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Stack spacing={2}>
            
            <Box sx={{ m: 4 }}>
              <Box sx={{ mt: 4 }}>
                <TextField
                  id="standard-basic"
                  variant="standard"
                  fullWidth
                  label="Search Categories"
                  type="search"
                  value={query}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ color: "text.primary" }}
                      >
                        <SearchRoundedIcon fontSize="large" />
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: "1.25rem",
                      height: "60px",
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.8rem",
                      top: "-15px",
                      left:"5px",
                    },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "40px",
                    },
                  }}
                />
              </Box>
            </Box>
            {/* Data Tables Here */}
            <CustomizedDataGrid
              rows={userData.filteredUsers.rows}
              columns={userData.filteredUsers.columns}
            />
            {/* <CustomizedDataGrid rows={evalData.rows} columns={evalData.columns}/> */}
            <PageViewsBarChart />
            <PageViewsChart />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row", md: "column" }}
          >
            <CustomizedTreeView />
            <ChartUserByCountry />
          </Stack>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
