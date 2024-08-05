import * as React from 'react';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function CustomizedDataGrid(props) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleSelectionModelChange = (newSelection) => {
    if (newSelection.length > 0) {
      const selectedId = newSelection[0]; // Since we are disabling multiple row selection
      const selectedRowData = props.rows.find(row => row.id === selectedId);
      setRowSelectionModel(newSelection); // Ensure to set the new selection model
      setSelectedRow(selectedRowData);
    } else {
      setRowSelectionModel([]); // Clear selection model when no selection
      setSelectedRow(null); // No selection
    }
  };

  useEffect(() => {
    if (selectedRow) {
      if (typeof props.setConversationUser === 'function') {
        props.setConversationUser(selectedRow.id); // action passed as props
      } else {
        console.warn('setConversationUser is not a function');
      }
    }
  }, [selectedRow, props]);

  return (
    <DataGrid
      checkboxSelection={true}
      disableMultipleRowSelection ={true}
      rows={props.rows}
      columns={props.columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[10, 25, 50]}
      onRowSelectionModelChange={handleSelectionModelChange}
      rowSelectionModel={rowSelectionModel}
    />
  );
}