import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

export function renderStatus(params) {
  
  const colors = {
    new: 'info',
    verified: 'success',
    blocked: 'error',
    uncertain: 'default',
  };

  return (
    <Chip
      label={params.value.status}
      color={colors[params.value.status]}
      variant="outlined"
    />
  );
}
export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'pageTitle', headerName: 'Page Title', width: 200 },
  { field: 'eventCount', headerName: 'Event Count', width: 130 },
  { field: 'users', headerName: 'Users', width: 100 },
  {
    field: 'viewsPerUser',
    headerName: 'Views per User',
    width: 130,
  },
  { field: 'averageTime', headerName: 'Average Time', width: 130 },
  { field: 'conversions', headerName: 'Conversions', width: 120 },
];

export const rows = [params.value.row];
