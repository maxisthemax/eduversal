import { formatDate } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";

//*lodash
import startCase from "lodash/startCase";

//*components
import { Page, useCustomTabs } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";
import PurchaseDetails from "./PurchaseDetails";
import CartDetails from "./CartDetails";

//*mui
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useOrder } from "@/data/order";

//*utils
import { statusColor } from "@/utils/constant";

function Purchase() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const { tabsComponent } = useCustomTabs({
    tabs: [
      {
        label: "All",
        value: "all",
        render: <PurchaseComponent status={"ALL"} />,
      },
      {
        label: "Pending",
        value: "pending",
        render: <PurchaseComponent status={"PENDING"} />,
      },
      {
        label: "Completed",
        value: "completed",
        render: <PurchaseComponent status={"COMPLETED"} />,
      },
      {
        label: "Cancelled/Refund",
        value: "cancelled/refund",
        render: <PurchaseComponent status={"CANCELLED/REFUND"} />,
      },
    ],
    defaultTab: "all",
    isPaper: false,
    variant: "fullWidth",
  });

  return orderId ? (
    <PurchaseDetails />
  ) : (
    <Page
      title="Purchase"
      subtitle="Manage your purchase"
      backgroundColor="white"
    >
      {tabsComponent}
    </Page>
  );
}
export default Purchase;

function PurchaseComponent({ status }) {
  const { orderDataByStatus } = useOrder(status);
  const { push } = useRouter();

  return (
    <Stack sx={{ height: getFullHeightSize(39.9), p: 2 }} spacing={2}>
      {orderDataByStatus.map(
        ({ cart, id, status, created_at, price, order_no }) => {
          return (
            <Paper key={id} variant="outlined">
              <Stack
                direction="row"
                sx={{
                  p: 2,
                  justifyContent: "space-between",
                  borderRadius: 0,
                  color: "inherit",
                }}
                component={Button}
                fullWidth
                onClick={() => push(`/account/purchase?orderId=${id}`)}
              >
                <Stack direction="row" spacing={2}>
                  <CustomIcon icon="list_alt" />
                  <Typography variant="body1">
                    ORDER ID: ORDER #{order_no}
                  </Typography>
                </Stack>
                <Typography variant="body1" color={statusColor[status]}>
                  {startCase(status)}
                </Typography>
              </Stack>
              <Divider />
              <CartDetails cart={cart} />
              <Divider />
              <Stack
                direction="row"
                sx={{ p: 2, justifyContent: "space-between" }}
              >
                <Typography variant="body1">
                  Placed on {formatDate(created_at, "dd MMMM yyyy")}
                </Typography>
                <Typography variant="body1">
                  <b>RM {price.toFixed(2)}</b>
                </Typography>
              </Stack>
            </Paper>
          );
        }
      )}
    </Stack>
  );
}
