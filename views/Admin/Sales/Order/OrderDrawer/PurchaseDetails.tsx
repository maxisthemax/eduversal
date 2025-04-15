import { useEffect } from "react";
import { formatDate } from "date-fns";

//*components
import CartDetails from "./CartDetails";

//*mui
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

//*utils
import { statusColor } from "@/utils/constant";

//*data
import { useOrder } from "@/data/admin/sales/order";
import { useGetStaffAccess } from "@/data/admin/user/staff";

declare global {
  interface Window {
    TrackButton?: {
      track: (options: { tracking_number: string }) => void;
    };
  }
}

function PurchaseDetails({ orderId }: { orderId: string }) {
  const access = useGetStaffAccess("sales_order_details");
  const { orderDataById, updateOrder, status } = useOrder();
  const orderData = orderDataById[orderId];

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

  const linkTrack = () => {
    if (window.TrackButton) {
      window.TrackButton.track({ tracking_number: orderData.tracking_no });
    } else {
      console.warn("Tracking script not loaded yet");
    }
  };

  if (status === "pending") return <LinearProgress />;

  return (
    <Paper variant="outlined" sx={{ px: 2, pt: 2, overflowY: "auto" }}>
      <Stack direction="column" spacing={2}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", width: "100%" }}
        >
          <Typography variant="h6">ORDER #{orderData.order_no}</Typography>
          <Select
            disabled={!access.edit}
            value={orderData.status}
            sx={{ color: statusColor[orderData.status] }}
            onChange={async (e) => {
              await updateOrder(orderId, { status: e.target.value });
            }}
          >
            <MenuItem value="PENDING" sx={{ color: statusColor["PENDING"] }}>
              PENDING
            </MenuItem>
            <MenuItem
              value="COMPLETED"
              sx={{ color: statusColor["COMPLETED"] }}
            >
              COMPLETED
            </MenuItem>
            <MenuItem
              value="CANCELLED"
              sx={{ color: statusColor["CANCELLED"] }}
            >
              CANCELLED
            </MenuItem>
            <MenuItem value="REFUND" sx={{ color: statusColor["REFUND"] }}>
              REFUND
            </MenuItem>
          </Select>
        </Stack>
        <Stack direction="row" sx={{ width: "100%" }} spacing={6}>
          <Typography variant="body1" sx={{ whiteSpace: "break-spaces" }}>
            <b>Shipping Method:</b>
            <br />
            {orderData.shipment_method_format}
            <br />
            {orderData.tracking_no && orderData.shipment_method === "ship" && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  linkTrack();
                }}
              >
                {orderData.tracking_no}
              </a>
            )}
            {orderData.shipment_method === "in-store" &&
              "\nCollect From Teacher"}
          </Typography>
          <Typography variant="body1">
            <b>Remark:</b>
            <br />
            {orderData.remark}
          </Typography>
        </Stack>
        {orderData.shipment_method === "ship" && (
          <Stack
            direction="row"
            sx={{ width: "100%", whiteSpace: "break-spaces" }}
            spacing={6}
          >
            <Typography variant="body1">
              <b>Shipping Address:</b>
              <br />
              {orderData.shipping_address_format}
            </Typography>
          </Stack>
        )}
        <Divider sx={{ mx: "-16px !important" }} />
        <CartDetails cart={orderData.cart} />
        <Divider sx={{ mx: "-16px !important" }} />
        <Stack direction="row" sx={{ p: 2, justifyContent: "space-between" }}>
          <Typography variant="body1">
            Placed on {formatDate(orderData.created_at, "dd MMMM yyyy h:mm a")}
          </Typography>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={10}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body1"
                sx={{ width: "130px", textAlign: "end" }}
              >
                <b>Subtotal:</b>
              </Typography>
              <Typography variant="body1">
                <b>
                  RM{" "}
                  {(
                    Number(orderData.price) - Number(orderData.shipping_fee)
                  ).toFixed(2)}
                </b>
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={10}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body1"
                sx={{ width: "130px", textAlign: "end" }}
              >
                <b>Shipping Fee:</b>
              </Typography>
              <Typography variant="body1">
                <b>RM {orderData.shipping_fee.toFixed(2)}</b>
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={10}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body1"
                sx={{ width: "130px", textAlign: "end" }}
              >
                <b>Total:</b>
              </Typography>
              <Typography variant="body1">
                <b>RM {orderData.price.toFixed(2)}</b>
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={10}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body1"
                sx={{ width: "130px", textAlign: "end" }}
              >
                <b>Payment Method:</b>
              </Typography>
              <Typography variant="body1">
                <b>{orderData.payment_method_format}</b>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default PurchaseDetails;
