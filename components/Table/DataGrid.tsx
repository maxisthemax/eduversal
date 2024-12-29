//*mui
import { DataGrid as DataGridMui, GridToolbar } from "@mui/x-data-grid";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function DataGrid({ data, columns, loading = false, gap = 0 }) {
  return (
    <DataGridMui
      sx={{ height: getFullHeightSize(gap) }}
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
