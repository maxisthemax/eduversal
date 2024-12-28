//*mui
import Box from "@mui/material/Box";
import { DataGrid as DataGridMui, GridToolbar } from "@mui/x-data-grid";

function DataGrid({ data, columns }) {
  return (
    <Box sx={{ p: 2 }}>
      <DataGridMui
        disableColumnSelector
        disableDensitySelector
        density="compact"
        rows={data}
        columns={columns}
        disableRowSelectionOnClick={true}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </Box>
  );
}

export default DataGrid;
