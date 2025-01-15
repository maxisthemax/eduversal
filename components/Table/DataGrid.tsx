/* eslint-disable @typescript-eslint/no-explicit-any */
//*mui
import {
  DataGrid as DataGridMui,
  GridToolbar,
  GridFeatureMode,
  GridPaginationModel,
  GridCallbackDetails,
} from "@mui/x-data-grid";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function DataGrid({
  data,
  columns,
  loading = false,
  gap = 0,
  pagination,
  height = "height",
}: {
  data: any[];
  columns: any[];
  loading?: boolean;
  gap?: number;
  pagination?: {
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (
      model: GridPaginationModel,
      details: GridCallbackDetails<"pagination">
    ) => void;
    rowCount: number;
    paginationMode?: GridFeatureMode;
  };
  height?: "height" | "maxHeight";
}) {
  const paginationModel = pagination?.paginationModel;
  const onPaginationModelChange = pagination?.onPaginationModelChange;
  const rowCount = pagination?.rowCount;
  const paginationMode = pagination?.paginationMode || "client";

  return (
    <DataGridMui
      rowCount={rowCount}
      paginationModel={paginationModel}
      paginationMode={paginationMode}
      onPaginationModelChange={onPaginationModelChange}
      sx={{ [height]: getFullHeightSize(gap) }}
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
