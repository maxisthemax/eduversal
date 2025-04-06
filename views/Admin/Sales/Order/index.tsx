import { useEffect, useState } from "react";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";

//*/lodash
import some from "lodash/some";

//*components
import DataGrid from "@/components/Table/DataGrid";
import NoAccess from "@/components/Box/NoAccess";
import { FlexBox, OverlayBox } from "@/components/Box";

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
  const access = useGetStaffAccess("sales_order_details");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>({
    order_no: "",
    cust_name: "",
    cust_phone: "",
    tracking_no: "",
    transaction_no: "",
  });
  const {
    orderData,
    pagination,
    status,
    setFilter,
    isRefetching,
    updateOrder,
    isUpdating,
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
      field: "created_at",
      headerName: "Created At",
      type: "dateTime",
      width: 180,
    },
    {
      field: "order_no",
      headerName: "Order No",
      minWidth: 100,
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
                    {...bindTrigger(popupState)}
                    color={
                      Boolean(params?.row.tracking_no) ? "primary" : "error"
                    }
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
      field: "transaction_id",
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

  if (!access.view) return <NoAccess />;

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
            sx={{ width: 240 }}
          />
        </Stack>
        <Stack direction={"row"} gap={2} flexWrap={"wrap"} sx={{ pb: 2 }}>
          <TextField
            label="Transaction No"
            name="transaction_no"
            value={orderFilter?.transaction_no}
            fullWidth={false}
            onChange={handleTextFieldChange}
            sx={{ width: 300 }}
          />
          <TextField
            label="Tracking No"
            name="tracking_no"
            sx={{ width: 300 }}
            value={orderFilter?.tracking_no}
            fullWidth={false}
            onChange={handleTextFieldChange}
          />
          <Button
            disabled={
              !(
                some(orderFilter, (value) => value === "") &&
                some(orderFilter, (value) => value !== "")
              )
            }
            variant="contained"
            onClick={() => {
              console.log(orderFilter);
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
              });
              setFilter({
                order_no: "",
                cust_name: "",
                cust_phone: "",
                tracking_no: "",
                transaction_no: "",
              });
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
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
        />
      </OverlayBox>
    </Box>
  );
}

export default Order;
