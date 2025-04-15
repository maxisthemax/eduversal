import { useEffect } from "react";
import { formatDate } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

//*components
import CartDetails from "./CartDetails";
import PaymentDialog, { usePaymentStore } from "@/views/Checkout/PaymentDialog";
import { Page } from "@/components/Box";

//*mui
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useOrder } from "@/data/order";

//*utils
import { statusColor } from "@/utils/constant";
import axios from "@/utils/axios";

declare global {
  interface Window {
    TrackButton?: {
      track: (options: { tracking_number: string }) => void;
    };
  }
}

const eghlPymtMethod = {
  fpx: "DD",
  credit_debit: "CC",
  e_wallet: "WA",
};

function PurchaseDetails() {
  const params = useSearchParams();
  const { push } = useRouter();
  const orderId = params.get("orderId");
  const { orderDataById, status } = useOrder();
  const orderData = orderDataById[orderId];
  const { paymentData, setPaymentData } = usePaymentStore();

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
    <Page>
      <Button
        onClick={() => {
          push("/account/purchase");
        }}
        sx={{ pb: 1 }}
      >
        Back
      </Button>
      <Paper
        variant="outlined"
        sx={{ px: 2, pt: 2, height: getFullHeightSize(20), overflowY: "auto" }}
      >
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
              {orderData.tracking_no &&
                orderData.shipment_method === "ship" && (
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
              Placed on{" "}
              {formatDate(orderData.created_at, "dd MMMM yyyy h:mm a")}
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
        {orderData.status === "PENDING" && (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "end",
              position: "sticky",
              bottom: 0,
              py: 1,
              backgroundColor: "background.paper",
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const res = await axios.post("payment/requestPayment", {
                  PymtMethod: eghlPymtMethod[orderData.payment_method],
                  OrderNumber: orderData.order_no,
                  PaymentID: `${orderData.order_no}_${formatDate(
                    new Date(),
                    "yyyyMMddHHmmssSS"
                  )}`,
                  Amount: orderData.price.toFixed(2),
                  CurrencyCode: "MYR",
                });
                setPaymentData({
                  ...res.data,
                  PaymentDesc: `${orderData.cart.length} item(s)`,
                  CustEmail: orderData.cust_email,
                  CustName: orderData.cust_name,
                  CustPhone: orderData.cust_phone,
                });
              }}
            >
              Make Payment
            </Button>
          </Box>
        )}
      </Paper>
      {paymentData && <PaymentDialog />}
    </Page>
  );
}

export default PurchaseDetails;
