import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Search from './Search';
import CustomDatePicker from './CustomDatePicker';

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
      <Stack sx={{ maxWidth: 500 }}>
        <Typography variant="h4" component="h1">
          Genesys Cloud Agent Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Real-time Agent Monitoring to provide insight inorder to improve overall performance!
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, width: { xs: '100%', sm: 'auto' } }}>
        <Search />
        <CustomDatePicker />
      </Stack>
    </Stack>
  );
}
