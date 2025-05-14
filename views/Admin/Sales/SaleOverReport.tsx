/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import qs from "querystring";
import { toast } from "react-toastify";

//*components
import DataGrid from "@/components/Table/DataGrid";
import NoAccess from "@/components/Box/NoAccess";
import DatePicker from "@/components/Date/DatePicker";
import { OverlayBox } from "@/components/Box";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { GridColDef } from "@mui/x-data-grid";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*data
import { useGetStaffAccess } from "@/data/admin/user/staff";

interface Filter {
  from_date: string;
  to_date: string;
  [string: string]: string;
}

const filter = {
  from_date: "",
  to_date: "",
};

function SaleOverReport() {
  const [saleOverReportFilterQuery, setSaleOverReportFilterQuery] =
    useState<Filter>(filter);

  const [saleOverReportFilter, setSaleOverReportFilter] =
    useState<Filter>(filter);

  const access = useGetStaffAccess("sales_school_sales");

  const { data, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "sales",
      "saleoverreport",
      qs.stringify(saleOverReportFilterQuery),
    ],
    `admin/sales/saleoverreport?${qs.stringify(saleOverReportFilterQuery)}`,
    {
      enabled:
        saleOverReportFilterQuery.from_date !== "" &&
        saleOverReportFilterQuery.to_date !== "",
    }
  );

  const saleOverReportData = useMemo(() => {
    if (!data?.data) return [];
    const result = data?.data.map((item: any, index) => ({
      id: index,
      date: item.date,
      count: item.count,
      total: item.total,
    }));

    const summaryRow = {
      id: "summary",
      date: "Total",
      count: result.reduce((acc: number, item: any) => acc + item.count, 0),
      total: result
        .reduce((acc: number, item: any) => acc + item.total, 0)
        .toFixed(2),
    };

    return [...result, summaryRow];
  }, [data]);

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "date",
      headerName: "Date",
      headerAlign: "left",
      minWidth: 80,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      align: "left",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              fontWeight: params.row.id === "summary" ? "bold" : "normal",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "count",
      headerName: "Total Transactions",
      headerAlign: "left",
      minWidth: 150,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      align: "right",
      rowSpanValueGetter: (value, row) => {
        console.log("🚀 ~ SaleOverReport ~ row:", row);
        if (row.id === "summary") {
          return "summary";
        } else return row.date;
      },
    },
    {
      field: "total",
      headerName: "Total Sales",
      headerAlign: "left",
      minWidth: 150,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      align: "right",
      valueFormatter: (value: number) => {
        if (value && value > 0) return `${Number(value)?.toFixed(2)}`;
        else return "";
      },
    },
  ];

  if (!access.view) return <NoAccess />;

  return (
    <Box sx={{ p: 2 }}>
      <OverlayBox isLoading={isLoading}>
        <Stack direction={"row"} gap={2} flexWrap={"wrap"} sx={{ pb: 2 }}>
          <DatePicker
            fullWidth={false}
            label="From Date"
            value={
              saleOverReportFilter?.from_date !== ""
                ? new Date(saleOverReportFilter?.from_date)
                : null
            }
            onChange={(newValue) => {
              setSaleOverReportFilter((prev) => ({
                ...prev,
                from_date: isValid(newValue)
                  ? format(newValue, "yyyy-MM-dd")
                  : "",
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: false,
                onKeyDown: (e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                  }
                },
              },
              field: {
                clearable: true,
                onClear: () => {
                  setSaleOverReportFilter((prev) => ({
                    ...prev,
                    from_date: "",
                  }));
                },
              },
            }}
          />
          <DatePicker
            fullWidth={false}
            label="To Date"
            value={
              saleOverReportFilter?.to_date !== ""
                ? new Date(saleOverReportFilter?.to_date)
                : null
            }
            onChange={(newValue) => {
              setSaleOverReportFilter((prev) => ({
                ...prev,
                to_date: isValid(newValue)
                  ? format(newValue, "yyyy-MM-dd")
                  : "",
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: false,
                onKeyDown: (e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                  }
                },
              },
              field: {
                clearable: true,
                onClear: () => {
                  setSaleOverReportFilter((prev) => ({
                    ...prev,
                    to_date: "",
                  }));
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (
                saleOverReportFilter.from_date !== "" &&
                saleOverReportFilter.to_date !== ""
              ) {
                setSaleOverReportFilterQuery(saleOverReportFilter);
                refetch();
              } else {
                toast.error("Please select From Date and To Date", {
                  position: "top-right",
                });
              }
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSaleOverReportFilterQuery(filter);
              setSaleOverReportFilter(filter);
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
          showCellVerticalBorder={true}
          density="compact"
          height="maxHeight"
          data={saleOverReportData}
          columns={columns}
          gap={18.7}
          showQuickFilter={false}
          disableFilter={true}
          fileName="Shipping_Report"
          rowSpanning={true}
        />
      </OverlayBox>
    </Box>
  );
}

export default SaleOverReport;
