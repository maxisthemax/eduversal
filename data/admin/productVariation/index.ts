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
  preview_url: string;
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
  preview_url?: string;
  preview_image?: string;
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
    const formData = new FormData();
    formData.append("name", productVariation.name);
    formData.append("description", productVariation.description);
    formData.append(
      "is_downloadable",
      productVariation.is_downloadable.toString()
    );
    formData.append(
      "options",
      JSON.stringify(
        productVariation.options.map((data) => {
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            currency: data.currency,
            price: data.price,
            status: data.status,
          };
        })
      )
    );

    productVariation.options.forEach((option, index) => {
      if (option.preview_image)
        formData.append(
          `options[${index}][preview_image]`,
          option.preview_image
        );
    });

    await axios.post(`admin/productvariation`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
