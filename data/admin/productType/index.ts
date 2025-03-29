import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface ProductTypeData {
  id: string;
  name: string;
  type: string;
  is_deliverable: boolean;
  currency: string;
  price: number;

  price_format: string;
  is_deliverable_format: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductTypeCreate {
  name: string;
  type: string;
  is_deliverable: boolean;
  currency: string;
  price: number;
}

type ProductTypeUpdate = Partial<ProductTypeCreate>;

export function useProductType(productTypeId?: string): {
  productsData: ProductTypeData[];
  productsDataById: Record<string, ProductTypeData>;
  productData: ProductTypeData;
  addProductType: (productType: ProductTypeCreate) => Promise<void>;
  updateProductType: (
    id: string,
    productType: ProductTypeUpdate
  ) => Promise<void>;
  deleteProductType: (id: string) => Promise<void>;
  status: string;
  isDeleting: boolean;
} {
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch productTypes data
  const { data, status, isLoading, refetch } = useQueryFetch(
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
        is_deliverable_format: data.is_deliverable ? "Yes" : "No",
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [productTypesQueryData, isLoading]);

  // Memoize productType data by id
  const productsDataById = useMemo(() => {
    return keyBy(productsData, "id");
  }, [productsData]);

  // Get specific productType data by ID
  const productData = productsDataById[productTypeId];

  async function addProductType(productType: ProductTypeCreate) {
    await axios.post(`admin/producttype`, productType);
    refetch();
  }

  const updateProductType = async (
    id: string,
    productType: ProductTypeUpdate
  ) => {
    const currentProductType = productsDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(
      currentProductType,
      productType
    );
    if (isEmpty) return;

    await axios.put(`admin/producttype/${id}`, changes);
    refetch();
  };

  const deleteProductType = async (id: string) => {
    try {
      setIsDeleting(true);
      await axios.delete(`admin/producttype/${id}`);
      setIsDeleting(false);
    } catch (error) {
      console.log(error);
      setIsDeleting(false);
    }

    refetch();
  };

  return {
    productsData,
    productsDataById,
    status,
    productData,
    addProductType,
    updateProductType,
    deleteProductType,
    isDeleting,
  };
}
