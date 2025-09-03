import { useEffect } from "react";
import { formatDate } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

//*components
import CartDetails from "./CartDetails";
import PaymentDialog, { usePaymentStore } from "@/views/Checkout/PaymentDialog";
import { Page } from "@/components/Box";
import { useCustomDialog } from "@/components/Dialog";

//*mui
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

//*data
import { useOrder } from "@/data/order";

//*utils
import { statusColor } from "@/utils/constant";
import axios from "@/utils/axios";
import { publicIpv4 } from "public-ip";

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
  const { handleOpenDialog } = useCustomDialog();

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
  if (!orderData) return <></>;
  return (
    <Page backgroundColor="white">
      <Button
        onClick={() => {
          push("/account/purchase");
        }}
        sx={{ mb: 1 }}
        variant="outlined"
      >
        Back
      </Button>
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          pt: 2,
        }}
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
          <Stack
            direction={{ xs: "column", sm: "column", md: "row" }}
            sx={{ p: 2, justifyContent: "space-between" }}
            spacing={1}
          >
            <Typography variant="body1">
              Placed on{" "}
              {formatDate(orderData.created_at, "dd MMMM yyyy h:mm a")}
            </Typography>
            <Stack spacing={1}>
              {[
                {
                  label: "Subtotal:",
                  value: `RM ${(
                    Number(orderData.price) - Number(orderData.shipping_fee)
                  ).toFixed(2)}`,
                },
                {
                  label: "Shipping Fee:",
                  value: `RM ${orderData.shipping_fee.toFixed(2)}`,
                },
                {
                  label: "Total:",
                  value: `RM ${orderData.price.toFixed(2)}`,
                },
                {
                  label: "Payment Method:",
                  value: `${orderData.payment_method_format}`,
                },
              ].map(({ label, value }, index) => {
                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={{ xs: 1, sm: 1, md: 10 }}
                    sx={{
                      justifyContent: {
                        xs: "start",
                        sm: "start",
                        md: "space-between",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        width: "130px",
                        textAlign: { xs: "start", sm: "start", md: "end" },
                      }}
                    >
                      <b>{label}</b>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: { xs: "start", sm: "start", md: "end" },
                      }}
                    >
                      <b>{value}</b>
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
        {orderData.status === "PENDING" && (
          <Stack
            direction={"row"}
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "end",
              position: "sticky",
              bottom: 0,
              py: 1,
              backgroundColor: "background.paper",
            }}
            spacing={1}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                handleOpenDialog({
                  title: "Change Payment Method",
                  description:
                    "Are you sure you want to change the payment method?",
                  textField: {
                    id: "select",
                    selectField: [
                      {
                        name: "Online Banking",
                        value: "fpx",
                      },
                      {
                        name: "Credit/Debit Card",
                        value: "credit_debit",
                      },
                      {
                        name: "E-Wallet",
                        value: "e_wallet",
                      },
                    ],
                    defaultValue: orderData.payment_method,
                  },
                  onConfirm: async (value) => {
                    const publicIp = await publicIpv4();
                    await axios.put("order", {
                      order_id: orderData.id,
                      payment_method: value,
                    });
                    const res = await axios.post("payment/requestPayment", {
                      PymtMethod: eghlPymtMethod[value],
                      OrderNumber: orderData.order_no,
                      PaymentID: `${orderData.order_no}_${formatDate(
                        new Date(),
                        "yyMMddHHmmss"
                      )}`,
                      Amount: orderData.price.toFixed(2),
                      CurrencyCode: "MYR",
                      publicIp,
                    });
                    setPaymentData({
                      ...res.data,
                      PaymentDesc: `${orderData.cart.length} item(s)`,
                      CustEmail: orderData.cust_email,
                      CustName: orderData.cust_name,
                      CustPhone: orderData.cust_phone,
                    });
                  },
                });
              }}
            >
              Change Payment
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const publicIp = await publicIpv4();
                const res = await axios.post("payment/requestPayment", {
                  PymtMethod: eghlPymtMethod[orderData.payment_method],
                  OrderNumber: orderData.order_no,
                  PaymentID: `${orderData.order_no}_${formatDate(
                    new Date(),
                    "yyMMddHHmmss"
                  )}`,
                  Amount: orderData.price.toFixed(2),
                  CurrencyCode: "MYR",
                  publicIp,
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
          </Stack>
        )}
      </Paper>
      {paymentData && <PaymentDialog />}
    </Page>
  );
}

export default PurchaseDetails;
