import { useState } from "react";

//*components
import PurchaseDetails from "./PurchaseDetails";

//*mui
import Link from "@mui/material/Link";
import Drawer from "@mui/material/Drawer";

//*data
import { OrderData } from "@/data/admin/sales/order";
import { QueryKey } from "@tanstack/react-query";

function OrderDrawer({
  orderData,
  queryKey,
}: {
  orderData: OrderData;
  queryKey?: QueryKey;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Link
        href="#"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {orderData.order_no}
      </Link>
      {open && (
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          anchor="right"
          PaperProps={{ sx: { width: "60%" } }}
        >
          <PurchaseDetails orderId={orderData.id} queryKey={queryKey} />
        </Drawer>
      )}
    </>
  );
}

export default OrderDrawer;
