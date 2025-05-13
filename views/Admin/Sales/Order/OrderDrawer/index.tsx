//*components
import PurchaseDetails from "./PurchaseDetails";

//*mui
import Drawer from "@mui/material/Drawer";

//*data
import { OrderData } from "@/data/admin/sales/order";
import { QueryKey } from "@tanstack/react-query";

function OrderDrawer({
  orderData,
  queryKey,
  onClose,
}: {
  orderData: OrderData;
  queryKey?: QueryKey;
  onClose?: () => void;
}) {
  return (
    <Drawer
      open={true}
      onClose={onClose}
      anchor="right"
      PaperProps={{ sx: { width: "60%" } }}
    >
      <PurchaseDetails orderId={orderData.id} queryKey={queryKey} />
    </Drawer>
  );
}

export default OrderDrawer;
