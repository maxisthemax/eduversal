//*mui
import { DataGrid as DataGridMui, GridToolbar } from "@mui/x-data-grid";

function DataGrid({ data, columns, loading = false }) {
  return (
    <DataGridMui
      loading={loading}
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
