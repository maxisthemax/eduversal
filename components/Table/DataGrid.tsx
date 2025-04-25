/* eslint-disable @typescript-eslint/no-explicit-any */
//*components
import { FlexBox } from "../Box";

//*lodash
import some from "lodash/some";

//*mui
import {
  DataGrid as DataGridMui,
  GridFeatureMode,
  GridPaginationModel,
  GridCallbackDetails,
  GridFilterModel,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  getGridNumericOperators,
  getGridStringOperators,
  getGridDateOperators,
  getGridBooleanOperators,
  getGridSingleSelectOperators,
  GridEventListener,
} from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";
import Box from "@mui/material/Box";

function DataGrid({
  data,
  columns,
  loading = false,
  gap = 0,
  pagination,
  height = "height",
  filter,
  autoRowHeightColumn,
  showQuickFilter = true,
  firstToolbarText,
  lastButton,
  onRowClick,
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
  autoRowHeightColumn?: string[];
  showQuickFilter?: boolean;
  firstToolbarText?: React.ReactNode;
  lastButton?: React.ReactNode;
  onRowClick?: GridEventListener<"rowClick">;
}) {
  const paginationModel = pagination?.paginationModel;
  const onPaginationModelChange = pagination?.onPaginationModelChange;
  const rowCount = pagination?.rowCount;
  const paginationMode = pagination?.paginationMode || "client";

  const filterMode = filter?.filterMode || "client";
  const onFilterChange = filter?.onFilterChange;

  return (
    <DataGridMui
      onRowClick={onRowClick ? onRowClick : () => {}}
      rowCount={rowCount}
      paginationModel={paginationModel}
      paginationMode={paginationMode}
      onPaginationModelChange={onPaginationModelChange}
      sx={{
        [height]: getFullHeightSize(gap),
        "& .MuiDataGrid-cell": {
          alignContent: "center",
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: "#f2f2f2 !important",
        },
        "& .MuiDataGrid-cell:focus": {
          outline: "none",
        },
        "& .MuiDataGrid-row:hover": {
          cursor: "pointer",
        },
        "& .stickyRight": {
          position: "sticky",
          right: 0,
          zIndex: 99,
          backgroundColor: "#fff", // keep it from overlapping with background
        },
        backgroundColor: "#fff",
      }}
      loading={loading}
      disableColumnSelector
      disableDensitySelector
      density="compact"
      rows={data}
      columns={columns
        .filter((column) => {
          return column;
        })
        .map((column) => {
          const newColumn = {
            ...column,
            filterOperators: [
              ...((column?.type ?? "string") === "string"
                ? getGridStringOperators().filter(
                    (operator) => operator.value === "contains"
                  )
                : []),
              ...(column.type === "number" ? getGridNumericOperators() : []),
              ...(column.type === "date" ? getGridDateOperators() : []),
              ...(column.type === "boolean" ? getGridBooleanOperators() : []),
              ...(column.type === "singleSelect"
                ? getGridSingleSelectOperators()
                : []),
            ],
          };
          if (newColumn.field === "button") {
            return {
              ...column,
              headerClassName: "stickyRight",
              cellClassName: "stickyRight",
              filterable: false,
              sortable: false,
              disableColumnMenu: true,
            };
          } else return newColumn;
        })}
      disableRowSelectionOnClick={true}
      slots={{ toolbar: CustomToolbar }}
      slotProps={{
        toolbar: {
          ...({ firstToolbarText } as any),
          ...({ lastButton } as any),
          showQuickFilter: showQuickFilter,
        },
      }}
      filterMode={filterMode}
      onFilterModelChange={onFilterChange}
      disableColumnFilter={filterMode === "server"}
      getRowHeight={({ model }) => {
        if (!autoRowHeightColumn) return null;
        else
          return some(autoRowHeightColumn, (columnId) => {
            return model[columnId];
          })
            ? "auto"
            : null;
      }}
      columnBufferPx={1000}
    />
  );
}

export default DataGrid;

function CustomToolbar(props: {
  firstToolbarText?: React.ReactNode;
  lastButton?: React.ReactNode;
  showQuickFilter?: boolean;
}) {
  const lastButton = props.lastButton;
  const firstToolbarText = props.firstToolbarText;
  const showQuickFilter = props.showQuickFilter;

  return (
    <GridToolbarContainer>
      <Stack
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          paddingBottom: 0.5,
        }}
        direction="row"
        spacing={2}
      >
        {firstToolbarText ? firstToolbarText : <></>}
        <FlexBox />
        {showQuickFilter && (
          <Box sx={{ background: "#f2f2f2", px: 1, height: "30.75px" }}>
            <GridToolbarQuickFilter variant="standard" />
          </Box>
        )}
        <GridToolbarFilterButton
          slotProps={{
            button: {
              color: "inherit",
              size: "small",
              variant: "outlined",
              sx: { maxHeight: "30.75px", textTransform: "capitalize" },
            },
          }}
        />
        <GridToolbarExport
          slotProps={{
            button: {
              color: "inherit",
              size: "small",
              variant: "outlined",
              sx: { maxHeight: "30.75px", textTransform: "capitalize" },
            },
          }}
        />
        {lastButton ? lastButton : <></>}
      </Stack>
    </GridToolbarContainer>
  );
}
