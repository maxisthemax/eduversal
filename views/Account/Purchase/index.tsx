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

//*data
import { useOrder } from "@/data/order";

//*utils
import { statusColor } from "@/utils/constant";
import Box from "@mui/material/Box";
import { t } from "@/helpers/useTranslation";

function Purchase() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const { tabsComponent } = useCustomTabs({
    tabs: [
      {
        label: t("All"),
        value: "all",
        render: <PurchaseComponent status={"ALL"} />,
      },
      {
        label: t("Pending"),
        value: "pending",
        render: <PurchaseComponent status={"PENDING"} />,
      },
      {
        label: t("Completed"),
        value: "completed",
        render: <PurchaseComponent status={"COMPLETED"} />,
      },
      {
        label: t("Cancelled/Refund"),
        value: "cancelled/refund",
        render: <PurchaseComponent status={"CANCELLED/REFUND"} />,
      },
    ],
    defaultTab: "all",
    isPaper: false,
    variant: "scrollable",
  });

  return orderId ? (
    <PurchaseDetails />
  ) : (
    <Page
      title={t("Purchase")}
      subtitle={t("Manage your purchase")}
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
    <Stack spacing={2}>
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
                    {t("ORDER ID")}: {t("ORDER")} #{order_no}
                  </Typography>
                </Stack>
                <Typography variant="body1" color={statusColor[status]}>
                  {t(startCase(status))}
                </Typography>
              </Stack>
              <Divider />
              <Box sx={{ px: 2 }}>
                <CartDetails cart={cart} />
              </Box>
              <Divider />
              <Stack
                direction="row"
                sx={{ p: 2, justifyContent: "space-between" }}
              >
                <Typography variant="body1">
                  {t("Placed on")} {formatDate(created_at, "dd MMMM yyyy")}
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
