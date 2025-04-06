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

//*utils
import { statusColor } from "@/utils/constant";

//*interface
import { OrderData } from "@/data/admin/sales/order";

declare global {
  interface Window {
    TrackButton?: {
      track: (options: { tracking_number: string }) => void;
    };
  }
}

function PurchaseDetails({ orderData }: { orderData: OrderData }) {
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
          <Typography
            variant="h6"
            sx={{ color: statusColor[orderData.status] }}
          >
            {orderData.status}
          </Typography>
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
              "\nYS Photoversal Studio,\nLot 3267, Jalan 18/36,\nTaman Sri Serdang,43300\nSeri Kembangan, Selangor"}
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
