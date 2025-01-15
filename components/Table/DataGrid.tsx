/* eslint-disable @typescript-eslint/no-explicit-any */
//*mui
import {
  DataGrid as DataGridMui,
  GridToolbar,
  GridFeatureMode,
  GridPaginationModel,
  GridCallbackDetails,
  GridFilterModel,
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
  filter,
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
  filter?: {
    filterMode: "server" | "client";
    onFilterChange: (model: GridFilterModel) => void;
  };
}) {
  const paginationModel = pagination?.paginationModel;
  const onPaginationModelChange = pagination?.onPaginationModelChange;
  const rowCount = pagination?.rowCount;
  const paginationMode = pagination?.paginationMode || "client";

  const filterMode = filter?.filterMode || "client";
  const onFilterChange = filter?.onFilterChange;

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
      filterMode={filterMode}
      onFilterModelChange={onFilterChange}
      disableColumnFilter={filterMode === "server"}
    />
  );
}

export default DataGrid;
