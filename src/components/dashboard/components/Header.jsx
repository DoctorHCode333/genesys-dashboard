import * as React from "react";
import Stack from "@mui/material/Stack";

import Search from "./Search";
import CustomDatePicker from "./CustomDatePicker";
import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Stack
    direction="column"
    sx={{
      gap: 1,
      width: { xs: "100%", sm: "auto" },
      alignItems: "left",
    }}
    >
      
      <Box
        sx={{
          width:"355px",
          boxShadow: 0,
          //bgcolor: 'transparent',
          backgroundImage: "none",
          alignItems: "center",
          backgroundColor: '#f57c00',
          // borderBottom: '5px solid',
          padding:"9px 15px",
          borderRadius: "20px",
        }}
      >
        <Stack
          direction="row"
          sx={{
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Typography sx={{ fontSize: '16px', color:"white" }}>FROM:</Typography>
          <CustomDatePicker />
          <Typography sx={{ fontSize: '16px', color:"white"  }}>TO:</Typography>
          <CustomDatePicker />
        </Stack>
      </Box>
    </Stack>
  );
}
