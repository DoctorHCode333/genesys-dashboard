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
            background: "linear-gradient(90deg, #FF7F00, #FF4500)", // Orange gradient track
            border: "none",
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#fff", // White background line
            opacity: 1,
          },
          "& .MuiSlider-thumb": {
            backgroundColor: "#fff", // White thumb
            border: "3px solid transparent", // Transparent border
            backgroundClip: "padding-box",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-3px",
              left: "-3px",
              right: "-3px",
              bottom: "-3px",
              borderRadius: "50%",
              background: "linear-gradient(90deg, #FF7F00, #FF4500)", // Orange gradient border
              zIndex: -1,
            },
            width: 18, // Adjust size
            height: 18,
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


"& .MuiSlider-thumb": {
    backgroundColor: "#fff",
    padding: "2px", // Create space for the gradient
    backgroundImage: "linear-gradient(90deg, #FF7F00, #FF4500)",
    backgroundOrigin: "border-box",
    backgroundClip: "content-box, border-box",
    border: "double 2px transparent",
    borderRadius: "50%",
    "&:hover, &.Mui-active": {
      boxShadow: "0px 0px 8px rgba(255, 127, 0, 0.5)",
    },
  },
