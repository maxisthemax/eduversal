import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";
import { checkSameValue } from "@/helpers/objectHelpers";

//*interface
export interface ProductVariationData {
  id: string;
  name: string;
  description: string;
  is_downloadable: boolean;
  options: ProductVariationOption[];

  created_at: Date;
  updated_at: Date;

  is_downloadable_format: string;
}

export interface ProductVariationOption {
  id: string;
  name: string;
  description: string;
  can_preview: boolean;
  currency: string;
  price: number;

  created_at: Date;
  updated_at: Date;

  price_format: string;
}

export interface ProductVariationCreate {
  name: string;
  description: string;
  is_downloadable: boolean;
  options: ProductVariationOptionCreate[];
}

export interface ProductVariationOptionCreate {
  id?: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  can_preview?: boolean;
  status?: string;
}

type ProductVariationUpdate = Partial<ProductVariationCreate>;

export function useProductVariation(productVariationId?: string): {
  productVariationsData: ProductVariationData[];
  productVariationsById: Record<string, ProductVariationData>;
  productVariationData: ProductVariationData;
  addProductVariation: (
    productVariation: ProductVariationCreate
  ) => Promise<void>;
  updateProductVariation: (
    id: string,
    productVariation: ProductVariationUpdate
  ) => Promise<void>;
  status: string;
} {
  // Fetch productVariations data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "productvariation"],
    `admin/productvariation`
  );

  const productVariationsQueryData = data?.data as ProductVariationData[];

  // Memoize productVariation data
  const productVariationsData = useMemo(() => {
    if (!isLoading && productVariationsQueryData) {
      return productVariationsQueryData.map((data) => ({
        ...data,
        is_downloadable_format: data.is_downloadable ? "Yes" : "No",
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        options: data.options.map((option) => ({
          ...option,
          price_format: option.currency + " " + option.price.toFixed(2),
        })),
      }));
    } else return [];
  }, [productVariationsQueryData, isLoading]);

  // Memoize productVariation data by id
  const productVariationsById = useMemo(() => {
    return keyBy(productVariationsData, "id");
  }, [productVariationsData]);

  // Get specific productVariation data by ID
  const productVariationData = productVariationsById[productVariationId];

  async function addProductVariation(productVariation: ProductVariationCreate) {
    await axios.post(`admin/productvariation`, {
      ...productVariation,
    });
    refetch();
  }

  const updateProductVariation = async (
    id: string,
    productVariation: ProductVariationUpdate
  ) => {
    const currentProductVariation = productVariationsById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(
      currentProductVariation,
      productVariation
    );
    if (isEmpty) return;

    await axios.put(`admin/productvariation/${id}`, changes);
    refetch();
  };

  return {
    productVariationsData,
    productVariationsById,
    status,
    productVariationData,
    addProductVariation,
    updateProductVariation,
  };
}
