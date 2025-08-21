import { useEffect, useState } from "react";
import PopupState, { bindPopover } from "material-ui-popup-state";
import { format, isValid } from "date-fns";
import qs from "querystring";

//*components
import DataGrid from "@/components/Table/DataGrid";
import NoAccess from "@/components/Box/NoAccess";
import DatePicker from "@/components/Date/DatePicker";
import { FlexBox, OverlayBox } from "@/components/Box";
import OrderDrawer from "./OrderDrawer";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import { GridColDef } from "@mui/x-data-grid";
import Link from "@mui/material/Link";

//*data
import { useGetStaffAccess } from "@/data/admin/user/staff";
import { OrderFilter, useOrder } from "@/data/admin/sales/order";

//*constant
import { statusColor } from "@/utils/constant";

function Order() {
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const access = useGetStaffAccess("sales_order_details");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>({
    order_no: "",
    cust_name: "",
    cust_phone: "",
    tracking_no: "",
    transaction_no: "",
    from_date: "",
    to_date: "",
  });
  const {
    orderData,
    pagination,
    status,
    setFilter,
    isRefetching,
    updateOrder,
    isUpdating,
    filter,
    orderDataById,
  } = useOrder();

  useEffect(() => {
    // Dynamically load the script
    const script = document.createElement("script");
    script.src = "//www.tracking.my/track-button.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  const linkTrack = (tracking_no: string) => {
    if (window.TrackButton) {
      window.TrackButton.track({ tracking_number: tracking_no });
    } else {
      console.warn("Tracking script not loaded yet");
    }
  };

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "order_no",
      headerName: "Order No",
      minWidth: 100,
    },
    {
      field: "created_at",
      headerName: "Created At",
      type: "dateTime",
      width: 180,
    },

    {
      field: "cust_name",
      headerName: "Parent",
      minWidth: 300,
    },
    {
      field: "cust_phone",
      headerName: "Phone No.",
      minWidth: 150,
    },
    {
      field: "tracking_no",
      headerName: "Tracking No",
      minWidth: 200,
      renderCell: (params) => {
        return (
          params.row.shipment_method === "ship" && (
            <PopupState variant="popover" popupId="menu">
              {(popupState) => (
                <>
                  <Link
                    href="#"
                    color={
                      Boolean(params?.row.tracking_no) ? "primary" : "error"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      popupState.open(e);
                    }}
                  >
                    {Boolean(params?.row.tracking_no)
                      ? params?.row.tracking_no
                      : "Need Update !!"}
                  </Link>
                  <Popover
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    onClose={() => {
                      if (isUpdating) return;
                      popupState.close();
                    }}
                    {...bindPopover(popupState)}
                  >
                    <Box sx={{ width: 200, p: 1 }}>
                      <TextField
                        disabled={isUpdating}
                        id="tracking_no"
                        autoFocus
                        defaultValue={params?.row.tracking_no}
                      />
                      <Stack direction={"row"} spacing={1} sx={{ pt: 1 }}>
                        <FlexBox />
                        <Button
                          disabled={isUpdating}
                          variant="outlined"
                          onClick={() => {
                            linkTrack(params?.row.tracking_no);
                          }}
                        >
                          Check
                        </Button>
                        {access.edit && (
                          <Button
                            disabled={isUpdating}
                            variant="contained"
                            onClick={async () => {
                              const trackingNo = document.getElementById(
                                "tracking_no"
                              ) as HTMLInputElement;
                              await updateOrder(params.row.id, {
                                tracking_no: trackingNo.value,
                                priority: 0,
                              });
                              popupState.close();
                            }}
                          >
                            Update
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Popover>
                </>
              )}
            </PopupState>
          )
        );
      },
    },
    {
      field: "shipment_method_format",
      headerName: "Shipment Method",
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography
            sx={{
              color: statusColor[params.row.status],
            }}
          >
            {params.row.status}
          </Typography>
        );
      },
    },
    {
      field: "transaction_no",
      headerName: "Transaction No.",
      minWidth: 200,
    },
    {
      field: "remark",
      headerName: "Remark",
      minWidth: 200,
    },
    {
      field: "price_format",
      headerName: "Total Amount",
      minWidth: 200,
    },
  ];

  if (!access.view) return <NoAccess />;

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setOrderFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <OverlayBox isLoading={isRefetching}>
        <Stack direction={"row"} gap={2} flexWrap={"wrap"} sx={{ pb: 2 }}>
          <TextField
            label="Order No"
            name="order_no"
            value={orderFilter?.order_no}
            fullWidth={false}
            onKeyDown={(event) => {
              const allowedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Tab",
              ];

              if (
                !allowedKeys.includes(event.key) &&
                !(event.key >= "0" && event.key <= "9")
              ) {
                event.preventDefault();
              }
            }}
            onChange={handleTextFieldChange}
            sx={{ width: 100 }}
          />
          <TextField
            label="Parent"
            name="cust_name"
            value={orderFilter?.cust_name}
            fullWidth={false}
            onChange={handleTextFieldChange}
            sx={{ width: 300 }}
          />
          <TextField
            label="Phone No"
            name="cust_phone"
            value={orderFilter?.cust_phone}
            fullWidth={false}
            onChange={handleTextFieldChange}
            sx={{ width: 160 }}
          />
          <TextField
            label="Transaction No"
            name="transaction_no"
            value={orderFilter?.transaction_no}
            fullWidth={false}
            onChange={handleTextFieldChange}
            sx={{ width: 250 }}
          />
          <TextField
            label="Tracking No"
            name="tracking_no"
            sx={{ width: 220 }}
            value={orderFilter?.tracking_no}
            fullWidth={false}
            onChange={handleTextFieldChange}
          />
          <DatePicker
            fullWidth={false}
            label="From Date"
            value={
              orderFilter?.from_date !== ""
                ? new Date(orderFilter?.from_date)
                : null
            }
            onChange={(newValue) => {
              setOrderFilter((prev) => ({
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
                  setOrderFilter((prev) => ({
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
              orderFilter?.to_date !== ""
                ? new Date(orderFilter?.to_date)
                : null
            }
            onChange={(newValue) => {
              setOrderFilter((prev) => ({
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
                  setOrderFilter((prev) => ({
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
              setFilter(orderFilter);
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOrderFilter({
                order_no: "",
                cust_name: "",
                cust_phone: "",
                tracking_no: "",
                transaction_no: "",
                from_date: "",
                to_date: "",
              });
              setFilter({
                order_no: "",
                cust_name: "",
                cust_phone: "",
                tracking_no: "",
                transaction_no: "",
                from_date: "",
                to_date: "",
              });
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
          onRowClick={(params) => {
            setOrderId(params.row.id);
          }}
          showCellVerticalBorder={true}
          loading={status === "pending"}
          height="maxHeight"
          data={orderData}
          columns={columns}
          gap={26.1}
          pagination={{
            paginationModel: pagination.pageModel,
            onPaginationModelChange: pagination.setPageModel,
            rowCount: pagination.totalCount,
            paginationMode: "server",
          }}
          showQuickFilter={false}
          fileName="Order_Report"
        />
        {orderId && (
          <OrderDrawer
            orderData={orderDataById[orderId]}
            queryKey={[
              "admin",
              "sales",
              "order",
              "page",
              pagination.pageModel.page,
              pagination.pageModel.pageSize,
              qs.stringify(filter),
            ]}
            onClose={() => {
              setOrderId(undefined);
            }}
          />
        )}
      </OverlayBox>
    </Box>
  );
}

export default Order;
