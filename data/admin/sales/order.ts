import { useMemo, useState } from "react";
import qs from "querystring";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";
import { paymentLabel } from "@/utils/constant";

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
  updated_at: Date;
  order_no: number;
  cust_name: string;
  cust_email: string;
  cust_phone: string;
  tracking_no: string;
  transaction_no: string;
  priority: number;

  payment_method_format: string;
  shipment_method_format: string;
  shipping_address_format: string;
}

export interface OrderFilter {
  order_no?: string;
  cust_name?: string;
  cust_phone?: string;
  tracking_no?: string;
  transaction_no?: string;
  from_date?: string;
  to_date?: string;
  [key: string]: string | undefined;
}

type UpdateOrderData = Partial<OrderData>;

export function useOrder(): {
  orderData: OrderData[];
  orderDataById: Record<string, OrderData>;
  status: string;
  pagination?: {
    currentPage: number;
    totalCount: number;
    pageModel: { page: number; pageSize: number };
    setPageModel: React.Dispatch<
      React.SetStateAction<{ page: number; pageSize: number }>
    >;
  };
  filter?: OrderFilter;
  setFilter?: React.Dispatch<React.SetStateAction<OrderFilter>>;
  isRefetching?: boolean;
  updateOrder: (id: string, data: UpdateOrderData) => Promise<UpdateOrderData>;
  isUpdating: boolean;
} {
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageModel, setPageModel] = useState({ page: 0, pageSize: 20 });
  const [filter, setFilter] = useState<OrderFilter>();

  const filteredFilter = filter
    ? Object.fromEntries(
        Object.entries(filter).filter(([, value]) => value !== "")
      )
    : {};

  // Fetch order data with pagination
  const { data, status, isLoading, isRefetching, refetch } = useQueryFetch(
    [
      "admin",
      "sales",
      "order",
      "page",
      pageModel.page,
      qs.stringify(filteredFilter),
    ],
    `admin/sales/order?page=${pageModel.page}&pageSize=${
      pageModel.pageSize
    }&${qs.stringify(filteredFilter)}`,
    { isKeepPreviousData: true }
  );

  const orderQueryData = data?.data as OrderData[];
  const currentPage = data?.currentPage || 0;
  const totalCount = data?.totalCount || 0;

  // Memoize order data
  const orderData = useMemo(() => {
    if (!isLoading && orderQueryData) {
      return orderQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        shipment_method_format:
          data.shipment_method === "ship" ? "Ship In" : "Pick up in store",
        price_format: `RM ${data.price.toFixed(2)}`,
        payment_method_format: paymentLabel[data.payment_method],
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
      }));
    } else return [];
  }, [orderQueryData, isLoading]);

  // Memoize order data by id
  const orderDataById = useMemo(() => {
    return keyBy(orderData, "id");
  }, [orderData]);

  const updateOrder = async (id: string, data: UpdateOrderData) => {
    try {
      setIsUpdating(true);
      await axios.put(`admin/sales/order/${id}`, data);
      setIsUpdating(false);
      refetch();
      return data;
    } catch (error) {
      console.log(error);
      setIsUpdating(false);
    }
  };

  return {
    orderData,
    orderDataById,
    status,
    pagination: { currentPage, totalCount, pageModel, setPageModel },
    filter,
    setFilter,
    isRefetching,
    updateOrder,
    isUpdating,
  };
}
