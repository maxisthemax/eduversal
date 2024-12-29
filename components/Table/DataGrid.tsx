//*mui
import { DataGrid as DataGridMui, GridToolbar } from "@mui/x-data-grid";

function DataGrid({ data, columns }) {
  return (
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
  );
}

export default DataGrid;
