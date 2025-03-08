import { useMemo, useState } from "react";

//*lodash
import filter from "lodash/filter";

//*utils
import axios from "@/utils/axios";

//*data
import { useUser } from "../user";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
export interface OrderData {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shipping_address: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cart: any;
  payment_method: string;
  shipment_method: string;
  shipping_fee: number;
  price: number;
  remark: string;
  status: string;
}

export interface OrderCreate {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shipping_address: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cart: any;
  payment_method: string;
  shipment_method: string;
  shipping_fee: number;
  price: number;
  remark: string;
  status: string;
}

export function useOrder(orderStatus?: string): {
  orderData: OrderData[];
  orderDataByStatus: OrderData[];
  status: string;
  isAdding: boolean;
  addOrder: (order: OrderCreate) => Promise<void>;
} {
  const { data: userData } = useUser();
  const [isAdding, setIsAdding] = useState(false);

  //*fetch order data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["order", userData?.id],
    `order`
  );

  const orderQueryData = data?.data as OrderData[];

  const orderData = useMemo(() => {
    if (!isLoading && orderQueryData) {
      return orderQueryData.map((data) => {
        return {
          ...data,
        };
      });
    } else return [];
  }, [orderQueryData, isLoading]);

  const orderDataByStatus = useMemo(() => {
    return filter(orderData, ({ status }) => {
      if (orderStatus === "ALL") return true;
      return status === orderStatus;
    });
  }, [orderData, orderStatus]);

  async function addOrder(order: OrderCreate) {
    setIsAdding(true);
    await axios.post(`order`, order);
    await refetch();
    setIsAdding(false);
  }

  return { orderData, orderDataByStatus, isAdding, addOrder, status };
}
