import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import qs from "querystring";

//*lodash
import orderBy from "lodash/orderBy";
import isEmpty from "lodash/isEmpty";
import uniqBy from "lodash/uniqBy";
import last from "lodash/last";

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
import { replaceStringAll } from "@/helpers/stringHelpers";

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

function ShippingReport() {
  const [shippingReportFilterQuery, setShippingReportFilterQuery] =
    useState<Filter>(filter);

  const [shippingReportFilter, setShippingReportFilter] =
    useState<Filter>(filter);

  const access = useGetStaffAccess("sales_school_sales");

  const { data, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "sales",
      "shippingreport",
      qs.stringify(shippingReportFilterQuery),
    ],
    `admin/sales/shippingreport?${qs.stringify(shippingReportFilterQuery)}`,
    {
      enabled: !isEmpty(shippingReportFilterQuery),
    }
  );

  const shippingReportData = useMemo(() => {
    if (!isLoading && data) {
      const result = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.data.forEach((order) => {
        const { userPackage, ...base } = order;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPackage.items.forEach((item: any, index: number) => {
          const newOrder = {
            ...base,
            userPackage: {
              ...userPackage,
              items: [item], // single item per row
            },
            id: `${order.id}_${index}`,
          };
          result.push(newOrder);
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapData = result.map((data: any) => {
        const productVariationOptionIdMap = {};

        data?.userPackage?.items[0]?.productVariationOptions?.forEach(
          (productVariationOption) => {
            const productVariationId =
              productVariationOption?.productVariationId ?? "";
            const productVariationOptionName =
              productVariationOption?.productVariationOptionName ?? "";

            productVariationOptionIdMap[productVariationId] =
              productVariationOptionName;
          }
        );

        return {
          ...data,
          pricing:
            Number(data.order?.price) - Number(data?.order?.shipping_fee ?? 0),
          orderNo: data?.order?.order_no,
          pacakgeName: data?.userPackage?.packageData?.name ?? "N/A",
          quantity: data?.quantity,
          totalPrice: data.order?.price,
          photoName: data?.userPackage?.items[0]?.photoName,
          custPhone: data?.order?.cust_phone,
          shipmentMethod:
            data?.order?.shipment_method === "ship" ? "Ship In" : "Pick Up",
          shippingFee: data?.order?.shipping_fee,
          shippingName: `${data?.order?.shipping_address?.first_name} ${data?.order?.shipping_address?.last_name} `,
          shippingAddress:
            data?.order?.shipment_method === "ship"
              ? `${data.order.shipping_address.address_1}${
                  data.order.shipping_address.address_2
                    ? ", \n" + data.order.shipping_address.address_2
                    : ""
                },\n${data.order.shipping_address.city}, ${
                  data.order.shipping_address.postcode
                }, ${data.order.shipping_address.state}`
              : "",
          tracking_no: data?.order?.tracking_no,
          remark: data?.order?.remark,
          ...productVariationOptionIdMap,
        };
      });

      return orderBy(mapData, ["orderNo", "packageName"], ["asc", "asc"]);
    }
    return [];
  }, [data, isLoading]);

  const productionVariationColumns = useMemo(() => {
    const columns = [];

    shippingReportData.forEach((item) => {
      item?.userPackage?.items[0]?.productVariationOptions?.forEach(
        (productVariationOption) => {
          columns.push({
            field: productVariationOption?.productVariationId,
            headerName: productVariationOption?.productVariationName,
            headerAlign: "center",
            minWidth: 120,
            disableColumnMenu: true,
            sortable: false,
            disableReorder: true,
            align: "center",
            valueFormatter: (value, rows) => {
              if (rows?.id !== "summary" && value === undefined) return "N/A";
              else return value;
            },
          });
        }
      );
    });
    return uniqBy(columns, "field");
  }, [shippingReportData]);

  const summaryRow = useMemo(() => {
    const quantityRow = uniqBy(shippingReportData, (row) => {
      if (row.userPackage?.packageId !== "none") {
        return `${row.orderNo}-${row.pacakgeName}`;
      } else return `${row.id}-${row.photoName}`;
    }).reduce((acc, row) => {
      const quantity = row.quantity ?? 0;
      const pricing = row.pricing ?? 0;
      const totalPrice = row.totalPrice ?? 0;
      acc["quantity"] = (acc["quantity"] || 0) + quantity;
      acc["pricing"] = (acc["pricing"] || 0) + pricing;
      acc["totalPrice"] = (acc["totalPrice"] || 0) + totalPrice;
      return acc;
    }, {});
    const totalRow = uniqBy(shippingReportData, "orderNo").reduce(
      (acc, row) => {
        const pricing = row.pricing ?? 0;
        const totalPrice = row.totalPrice ?? 0;
        acc["pricing"] = (acc["pricing"] || 0) + pricing;
        acc["totalPrice"] = (acc["totalPrice"] || 0) + totalPrice;
        return acc;
      },
      {}
    );

    return {
      id: "summary",
      [last(productionVariationColumns)?.field]: "Total",
      ...quantityRow,
      ...totalRow,
    };
  }, [shippingReportData, productionVariationColumns]);

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "orderNo",
      headerName: "Order No",
      headerAlign: "center",
      minWidth: 80,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      align: "center",
    },
    {
      field: "pacakgeName",
      headerName: "Package",
      headerAlign: "center",
      minWidth: 120,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}-${row.pacakgeName}` : value;
      },
      align: "center",
    },
    {
      field: "photoName",
      headerName: "Product",
      headerAlign: "center",
      minWidth: 180,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.id}-${row.photoName}` : value;
      },
      align: "center",
    },
    ...productionVariationColumns,
    {
      field: "quantity",
      headerName: "Quantity",
      headerAlign: "center",
      minWidth: 100,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        if (row.userPackage?.packageId !== "none") {
          return `${row.orderNo}-${row.pacakgeName}`;
        } else return `${row.id}-${row.photoName}`;
      },
      align: "center",
    },
    {
      field: "pricing",
      headerName: "Pricing (RM)",
      headerAlign: "center",
      minWidth: 120,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "custPhone",
      headerName: "Phone Number",
      headerAlign: "center",
      minWidth: 120,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "shipmentMethod",
      headerName: "Shipping Method",
      headerAlign: "center",
      minWidth: 140,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "shippingFee",
      headerName: "Shipping Fee",
      headerAlign: "center",
      minWidth: 120,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "shippingName",
      headerName: "Shipping Name",
      headerAlign: "center",
      minWidth: 180,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "shippingAddress",
      headerName: "Shipping Address",
      headerAlign: "center",
      minWidth: 300,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "tracking_no",
      headerName: "Tracking No",
      headerAlign: "center",
      minWidth: 200,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "remark",
      headerName: "Remark",
      headerAlign: "center",
      minWidth: 180,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
    },
    {
      field: "totalPrice",
      headerName: "Total Amount (RM)",
      headerAlign: "center",
      minWidth: 150,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.orderNo}` : value;
      },
      align: "center",
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
              shippingReportFilter?.from_date !== ""
                ? new Date(shippingReportFilter?.from_date)
                : null
            }
            onChange={(newValue) => {
              setShippingReportFilter((prev) => ({
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
                  setShippingReportFilter((prev) => ({
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
              shippingReportFilter?.to_date !== ""
                ? new Date(shippingReportFilter?.to_date)
                : null
            }
            onChange={(newValue) => {
              setShippingReportFilter((prev) => ({
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
                  setShippingReportFilter((prev) => ({
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
              setShippingReportFilterQuery(shippingReportFilter);
              refetch();
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setShippingReportFilterQuery(filter);
              setShippingReportFilter(filter);
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
          exceljsPostProcess={async ({ worksheet }) => {
            const quantityProcessData = shippingReportData.map((row) => {
              return {
                ...row,
                quantityId:
                  row.userPackage?.packageId !== "none"
                    ? `${row.orderNo}-${row.pacakgeName}`
                    : `${row.id}-${row.photoName}`,
              };
            });

            let firstIndex1 = 1;
            let firstIndex2 = 1;
            let firstIndex3 = 1;
            let previousOrderNo = worksheet.getRow(2).getCell(1).value; // Access the first column (column index 1)
            let previousOrderNoPackageName =
              worksheet.getRow(2).getCell(1).value +
              " " +
              worksheet.getRow(2).getCell(2).value;
            let previousQuantity = quantityProcessData[0].quantityId;
            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return; // Skip the header row
              const orderNo = row.getCell(1).value; // Access the first column (column index 1)
              const orderNoPackageName =
                row.getCell(1).value + " " + row.getCell(2).value;
              const phoneCell = row.getCell(6).value;
              if (typeof phoneCell === "string") {
                row.getCell(6).value = replaceStringAll(phoneCell, "'", "");
              }
              const quantity = quantityProcessData[rowNumber - 2]?.quantityId;

              if (orderNo !== previousOrderNo) {
                if (firstIndex1 > 1) {
                  worksheet.mergeCells(firstIndex1, 1, rowNumber - 1, 1);

                  [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((index) => {
                    const numbers =
                      index + productionVariationColumns.length + 1;
                    worksheet.mergeCells(
                      firstIndex1,
                      numbers,
                      rowNumber - 1,
                      numbers
                    );
                  });
                }
                firstIndex1 = rowNumber;
                previousOrderNo = orderNo;
              }

              if (orderNoPackageName !== previousOrderNoPackageName) {
                if (firstIndex2 > 1) {
                  worksheet.mergeCells(firstIndex2, 2, rowNumber - 1, 2);
                }
                firstIndex2 = rowNumber;
                previousOrderNoPackageName = orderNoPackageName;
              }

              if (previousQuantity !== quantity) {
                if (firstIndex3 > 1) {
                  worksheet.mergeCells(
                    firstIndex3,
                    4 + productionVariationColumns.length,
                    rowNumber - 1,
                    7
                  );
                }
                firstIndex3 = rowNumber;
                previousQuantity = quantity;
              }
            });
          }}
          showCellVerticalBorder={true}
          density="compact"
          height="maxHeight"
          data={[...shippingReportData, summaryRow]}
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

export default ShippingReport;
