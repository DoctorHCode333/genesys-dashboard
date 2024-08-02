import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Search from './Search';
import CustomDatePicker from './CustomDatePicker';
import { Box } from '@mui/material';

export default function Header() {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        justifyContent: 'space-between',
        gap: 2,
        my: 2,
      }}
    >
      {/* <Stack sx={{ maxWidth: 1000 }}>
        <Typography variant="h2" component="h1">
          Interaction Categories Dashboard
        </Typography>
      </Stack> */}
      <Stack direction="row" sx={{ gap: 1, width: { xs: '100%', sm: 'auto' } }}>
        <Box
         sx={{
          boxShadow: 0,
          //bgcolor: 'transparent',
          backgroundImage: 'none',
          alignItems: 'center',
          backgroundColor: '#f57c00',
          borderBottom: '5px solid',
         }}
        >
          <Typography variant="h6" component="h6">From</Typography>
          <CustomDatePicker />
          <Typography variant="h6" component="h6">To</Typography>
          <CustomDatePicker />
        </Box>
        
      </Stack>
    </Stack>
  );
}
