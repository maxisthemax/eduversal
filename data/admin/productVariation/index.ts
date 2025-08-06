import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";
import startsWith from "lodash/startsWith";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

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
  preview_url_key: string;
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
  preview_url_key?: string;
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
  isDeleting: boolean;
  deleteProductVariation: (id: string) => Promise<void>;
} {
  const [isDeleting, setIsDeleting] = useState(false);

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
          preview_url: `${
            startsWith(option.preview_url, "sgp1")
              ? "https://" + option.preview_url
              : option.preview_url
          }`,
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
            preview_url_key: data.preview_url_key,
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

    await axios.put(`admin/productvariation/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    refetch();
  };

  const deleteProductVariation = async (id: string) => {
    try {
      setIsDeleting(true);
      await axios.delete(`admin/productvariation/${id}`);
      setIsDeleting(false);
    } catch (error) {
      console.log(error);
      setIsDeleting(false);
    }

    refetch();
  };

  return {
    productVariationsData,
    productVariationsById,
    status,
    productVariationData,
    addProductVariation,
    updateProductVariation,
    isDeleting,
    deleteProductVariation,
  };
}
