import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

//*mui
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

//*data
import { PaymentData } from "@/data/order";
import { useCart } from "../Cart";

function PaymentDialog({ data }: { data: PaymentData }) {
  const { push } = useRouter();
  const { clearCart } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Set paying state immediately to show loading indicator
    setIsPaying(true);

    // Small timeout to ensure the form is rendered in the DOM
    const timer = setTimeout(() => {
      try {
        // Try to get the form by ref first, then by name as fallback
        const form = formRef.current;

        if (form) {
          form.submit();
          push(`/account/purchase?orderId=${data.order_id}`);
          setIsPaying(false);
          clearCart();
        } else {
          console.error("Payment form not found in the DOM");
          setIsPaying(false);
        }
      } catch (error) {
        console.error("Error submitting payment form:", error);
        setIsPaying(false);
      }
    }, 3000); // Give the dialog a second to render properly

    // Cleanup function to clear the timeout if component unmounts
    return () => clearTimeout(timer);
  }, [data]); // Re-run if payment data changes

  return (
    <Dialog open={true} fullWidth maxWidth="sm" disableEscapeKeyDown={isPaying}>
      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: 4,
          }}
        >
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h6" sx={{ mt: 4 }}>
            Processing Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please do not close this window. You will be redirected to the
            payment gateway...
          </Typography>
        </Box>

        <form
          ref={formRef}
          name="frmPayment"
          method="post"
          action="https://pay.e-ghl.com/IPGSG/Payment.aspx"
          style={{ display: "none" }} // Hide the form
          target="_self" // Open in a new tab
        >
          <input type="hidden" name="TransactionType" value="SALE" />
          <input type="hidden" name="PymtMethod" value={data.PymtMethod} />
          <input type="hidden" name="ServiceID" value={"sit"} />
          <input type="hidden" name="OrderNumber" value={data.OrderNumber} />
          <input type="hidden" name="PaymentID" value={data.PaymentID} />
          <input type="hidden" name="PaymentDesc" value={data.PaymentDesc} />
          <input
            type="hidden"
            name="MerchantReturnURL"
            value={data.MerchantReturnURL}
          />
          <input
            type="hidden"
            name="MerchantCallBackURL"
            value={data.MerchantCallBackURL}
          />
          <input type="hidden" name="Amount" value={data.Amount} />
          <input type="hidden" name="CurrencyCode" value={data.CurrencyCode} />
          <input type="hidden" name="CustIP" value={data.CustIP} />
          <input type="hidden" name="CustName" value={data.CustName} />
          <input type="hidden" name="CustEmail" value={data.CustEmail} />
          <input type="hidden" name="CustPhone" value={data.CustPhone} />
          <input type="hidden" name="HashValue" value={data.HashValue} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentDialog;
