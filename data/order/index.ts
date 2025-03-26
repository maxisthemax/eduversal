import { useMemo, useState } from "react";

//*lodash
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";

//*utils
import axios from "@/utils/axios";

//*data
import { useUser } from "../user";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
export interface OrderData {
  id: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    country_code: string;
    phone_no: string;
    address_1: string;
    address_2: string;
    postcode: string;
    state: string;
    city: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cart: any;
  payment_method: string;
  shipment_method: string;
  shipping_fee: number;
  price: number;
  remark: string;
  status: string;
  created_at: Date;
  order_no: number;

  payment_method_format: string;
  shipment_method_format: string;
  shipping_address_format: string;
}

export interface OrderCreate {
  shipping_address?: {
    first_name: string;
    last_name: string;
    email: string;
    country_code: string;
    phone_no: string;
    address_1: string;
    address_2: string;
    postcode: string;
    state: string;
    city: string;
  };
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
  orderDataById: Record<string, OrderData>;
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
      return orderBy(
        orderQueryData.map((data) => {
          return {
            ...data,
            created_at: new Date(data.created_at),
            shipment_method_format:
              data.shipment_method === "ship" ? "Ship In" : "Pick up in store",
            shipping_address_format:
              data.shipment_method === "ship"
                ? `${data.shipping_address.first_name} ${
                    data.shipping_address.last_name
                  } | ${data.shipping_address.country_code}${
                    data.shipping_address.phone_no
                  },\n${data.shipping_address.address_1}${
                    data.shipping_address.address_2
                      ? ", \n" + data.shipping_address.address_2
                      : ""
                  },\n${data.shipping_address.city}, ${
                    data.shipping_address.postcode
                  }, ${data.shipping_address.state}`
                : "",
            payment_method_format: {
              e_wallet: "E-Wallet",
              credit_debit: "Credit/Debit Card",
              fpx: "FPX",
            }[data.payment_method],
          };
        }),
        ["created_at"],
        ["desc"]
      );
    } else return [];
  }, [orderQueryData, isLoading]);

  const orderDataByStatus = useMemo(() => {
    return filter(orderData, ({ status }) => {
      if (orderStatus === "ALL") return true;
      return status === orderStatus;
    });
  }, [orderData, orderStatus]);

  // Memoize academic years data by id
  const orderDataById = useMemo(() => {
    return keyBy(orderData, "id");
  }, [orderData]);

  async function addOrder(order: OrderCreate) {
    setIsAdding(true);
    await axios.post(`order`, order);
    await refetch();
    setIsAdding(false);
  }

  return {
    orderData,
    orderDataByStatus,
    isAdding,
    addOrder,
    status,
    orderDataById,
  };
}
