import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
export interface ProductTypeData {
  id: string;
  name: string;
  type: string;
  is_deliverable: boolean;
  currency: string;
  price: number;

  price_format: string;
  created_at: Date;
  updated_at: Date;
}

// export interface ProductTypeCreate {
//   name: string;
// }

// type ProductTypeUpdate = Partial<ProductTypeCreate>;

export function useProductType(): {
  productsData: ProductTypeData[];
  productsDataById: Record<string, ProductTypeData>;
  status: string;
} {
  // Fetch productTypes data
  const { data, status, isLoading } = useQueryFetch(
    ["admin", "producttype"],
    `admin/producttype`
  );

  const productTypesQueryData = data?.data as ProductTypeData[];

  // Memoize productType data
  const productsData = useMemo(() => {
    if (!isLoading && productTypesQueryData) {
      return productTypesQueryData.map((data) => ({
        ...data,
        price_format: data.currency + " " + data.price.toFixed(2),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [productTypesQueryData, isLoading]);

  // Memoize productType data by id
  const productsDataById = useMemo(() => {
    return keyBy(productsData, "id");
  }, [productsData]);

  return {
    productsData,
    productsDataById,
    status,
  };
}
