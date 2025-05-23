/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from "date-fns";

//*components
import { FlexBox } from "../Box";

//*lodash
import some from "lodash/some";

//*mui
import {
  DataGridPremium as DataGridPremiumMui,
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
  GridColumnGroupingModel,
  GridExcelExportOptions,
} from "@mui/x-data-grid-premium";
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
  columnGroupingModel,
  density = "compact",
  disableFilter = false,
  showCellVerticalBorder = false,
  fileName,
  rowSpanning = false,
  exceljsPostProcess,
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
  columnGroupingModel?: GridColumnGroupingModel;
  density?: "compact" | "standard" | "comfortable";
  disableFilter?: boolean;
  showCellVerticalBorder?: boolean;
  fileName?: string;
  rowSpanning?: boolean;
  exceljsPostProcess?: GridExcelExportOptions["exceljsPostProcess"];
}) {
  const paginationModel = pagination?.paginationModel;
  const onPaginationModelChange = pagination?.onPaginationModelChange;
  const rowCount = pagination?.rowCount;
  const paginationMode = pagination?.paginationMode || "client";

  const filterMode = filter?.filterMode || "client";
  const onFilterChange = filter?.onFilterChange;

  return (
    <DataGridPremiumMui
      showCellVerticalBorder={showCellVerticalBorder} // Show vertical borders between cells
      columnGroupingModel={columnGroupingModel}
      onRowClick={onRowClick ? onRowClick : () => {}}
      rowCount={rowCount}
      pagination={true}
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
          "& .MuiDataGrid-cell": {
            backgroundColor: "#f2f2f2",
          },
        },
        "& .stickyRight": {
          position: "sticky",
          right: 0,
          zIndex: 99,
          backgroundColor: "#fff", // keep it from overlapping with background
        },
        backgroundColor: "#fff",
        '& div[style="position: absolute; pointer-events: none; color: rgba(130, 130, 130, 0.62); z-index: 100000; width: 100%; text-align: center; bottom: 50%; right: 0px; letter-spacing: 5px; font-size: 24px;"]':
          { display: "none" },
      }}
      loading={loading}
      disableColumnSelector
      disableDensitySelector
      density={density}
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
          disableFilter: disableFilter,
          fileName: fileName,
          exceljsPostProcess: exceljsPostProcess,
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
      columnBufferPx={500}
      rowBufferPx={500}
      unstable_rowSpanning={rowSpanning} // Disable row spanning
    />
  );
}

export default DataGrid;

function CustomToolbar(props: {
  firstToolbarText?: React.ReactNode;
  lastButton?: React.ReactNode;
  showQuickFilter?: boolean;
  disableFilter?: boolean;
  fileName?: string;
  exceljsPostProcess?: GridExcelExportOptions["exceljsPostProcess"];
}) {
  const lastButton = props.lastButton;
  const firstToolbarText = props.firstToolbarText;
  const showQuickFilter = props.showQuickFilter;
  const disableFilter = props.disableFilter;
  const fileName = props.fileName;
  const exceljsPostProcess = props.exceljsPostProcess;

  return (
    <GridToolbarContainer>
      <Stack
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          p: 1.5,
        }}
        direction="row"
        spacing={2}
      >
        {firstToolbarText ? firstToolbarText : <></>}
        <FlexBox />
        {showQuickFilter && (
          <Box sx={{ background: "#f2f2f2" }}>
            <GridToolbarQuickFilter
              slotProps={{
                input: {
                  disableUnderline: true,
                },
                htmlInput: {
                  sx: {
                    paddingTop: "0px !important",
                    paddingBottom: "0px !important",
                    margin: "0px !important",
                    height: "30.75px",
                    px: "10px !important",
                  },
                },
              }}
              sx={{
                paddingTop: "0px !important",
                paddingBottom: "0px !important",
                margin: "0px !important",
                height: "30.75px",
              }}
            />
          </Box>
        )}
        {!disableFilter && (
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
        )}
        <GridToolbarExport
          csvOptions={{ disableToolbarButton: true }}
          printOptions={{ disableToolbarButton: true }}
          slotProps={{
            button: {
              color: "inherit",
              size: "small",
              variant: "outlined",
              sx: { maxHeight: "30.75px", textTransform: "capitalize" },
            },
          }}
          excelOptions={{
            ...(exceljsPostProcess ? { exceljsPostProcess } : {}),
            ...(fileName
              ? {
                  fileName: `${fileName}_${formatDate(new Date(), "yyyyMMdd")}`,
                }
              : {}),
          }}
        />
        {lastButton ? lastButton : <></>}
      </Stack>
    </GridToolbarContainer>
  );
}
