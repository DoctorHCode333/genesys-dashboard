import React from "react";
import Slider from "@mui/material/Slider";
import { Box } from "@mui/material";

const CustomSlider = () => {
  return (
    <Box sx={{ width: 300, margin: "auto", mt: 5 }}>
      <Slider
        defaultValue={[20, 80]}
        valueLabelDisplay="auto"
        disableSwap
        sx={{
          color: "transparent",
          "& .MuiSlider-track": {
            background: "linear-gradient(90deg, #FF7F00, #FF4500)", // Orange gradient
            border: "none",
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#fff", // White background line
            opacity: 1,
          },
          "& .MuiSlider-thumb": {
            background: "linear-gradient(90deg, #FF7F00, #FF4500)", // Orange gradient thumb
            border: "2px solid white",
            "&:hover, &.Mui-active": {
              boxShadow: "0px 0px 8px rgba(255, 127, 0, 0.5)",
            },
          },
          "& .MuiSlider-valueLabel": {
            backgroundColor: "#FF4500",
          },
        }}
      />
    </Box>
  );
};

export default CustomSlider;
