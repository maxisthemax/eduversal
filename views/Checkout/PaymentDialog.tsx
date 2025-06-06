import { useEffect, useRef, useState } from "react";
import { create } from "zustand";

//*mui
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

//*data
import { useCart } from "../Cart";
import { PaymentData } from "@/data/order";

function PaymentDialog() {
  const { paymentData, clearPaymentData } = usePaymentStore();
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
          clearPaymentData();
          form.submit();
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
  }, [paymentData]); // Re-run if payment data changes

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
          action={process.env.NEXT_PUBLIC_EGHL_API_URL}
          target="_self"
        >
          <input type="hidden" name="TransactionType" value="SALE" />
          <input
            type="hidden"
            name="PymtMethod"
            value={paymentData.PymtMethod}
          />
          <input
            type="hidden"
            name="ServiceID"
            value={process.env.NEXT_PUBLIC_SERVICE_ID}
          />
          <input
            type="hidden"
            name="OrderNumber"
            value={paymentData.OrderNumber}
          />
          <input type="hidden" name="PaymentID" value={paymentData.PaymentID} />
          <input
            type="hidden"
            name="PaymentDesc"
            value={paymentData.PaymentDesc}
          />
          <input
            type="hidden"
            name="MerchantReturnURL"
            value={paymentData.MerchantReturnURL}
          />
          <input
            type="hidden"
            name="MerchantCallBackURL"
            value={paymentData.MerchantCallBackURL}
          />
          <input type="hidden" name="Amount" value={paymentData.Amount} />
          <input
            type="hidden"
            name="CurrencyCode"
            value={paymentData.CurrencyCode}
          />
          <input type="hidden" name="CustIP" value={paymentData.CustIP} />
          <input type="hidden" name="CustName" value={paymentData.CustName} />
          <input type="hidden" name="CustEmail" value={paymentData.CustEmail} />
          <input type="hidden" name="CustPhone" value={paymentData.CustPhone} />
          <input type="hidden" name="HashValue" value={paymentData.HashValue} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentDialog;

interface PaymentStore {
  paymentData: PaymentData | undefined;
  setPaymentData: (data: PaymentData | undefined) => void;
  clearPaymentData: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  paymentData: undefined,
  setPaymentData: (data) => set({ paymentData: data }),
  clearPaymentData: () => set({ paymentData: undefined }),
}));
