import * as React from 'react';
import { useEffect,useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';

export default function CustomizedDataGrid(props) {
  
  return (
    <DataGrid
      checkboxSelection
      rows={props.rows}
      columns={props.columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[10, 25, 50]}
      disableColumnResize
    />
  );
}
