import { useMemo } from "react";
import { useParams } from "next/navigation";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
import { ProductTypeData } from "../productType";

//*interface
export interface PhotoData {
  id: string;
  name: string;
  download_url: string;
  download_watermark_url: string;
  display_url: string;
  created_by_name: string;
  updated_by_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface AlbumData {
  id: string;
  name: string;
  description: string;
  product_variations_id: string[];
  albumProductVariations: AlbumProductVariationData[];
  product_type_id: string;
  product_type: ProductTypeData;
  institution_id: string;
  course_id: string;
  created_at: Date;
  updated_at: Date;
  photos: PhotoData[];
  created_by_name: string;
  updated_by_name: string;
}

export interface AlbumProductVariationData {
  album_id: string;
  productVariation_id: string;
}

export interface AlbumCreate {
  name: string;
  description: string;
  product_type_id: string;
  product_variations_id: string[];
  institution_id?: string;
  course_id?: string;
}

type AlbumUpdate = Partial<AlbumCreate>;

export function useAlbums(
  albumId?: string,
  otherParams?: { courseId: string }
): {
  albumsData: AlbumData[];
  albumsDataById: Record<string, AlbumData>;
  albumData: AlbumData | undefined;
  addAlbum: (album: AlbumCreate) => Promise<void>;
  updateAlbum: (id: string, album: AlbumUpdate) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  status: string;
} {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = (params.courseId as string) ?? otherParams?.courseId;

  // Fetch albums data
  const { data, status, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "institutions",
      institutionId,
      "academicYears",
      academicYearId,
      "courses",
      courseId,
      "albums",
    ],
    `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album`
  );

  const albumsQueryData = data?.data as AlbumData[];

  // Memoize albums data
  const albumsData = useMemo(() => {
    if (!isLoading && albumsQueryData) {
      return albumsQueryData.map((data) => ({
        ...data,
        product_type: {
          ...data.product_type,
          price_format:
            data.product_type.currency +
            " " +
            data.product_type.price.toFixed(2),
          is_deliverable_format: data.product_type.is_deliverable
            ? "Yes"
            : "No",
        },
        product_variations_id: data.albumProductVariations.map(
          ({ productVariation_id }) => productVariation_id
        ),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [albumsQueryData, isLoading]);

  // Memoize albums data by id
  const albumsDataById = useMemo(() => keyBy(albumsData, "id"), [albumsData]);

  // Get specific album data by albumId
  const albumData = albumId ? albumsDataById[albumId] : undefined;

  // Add album
  const addAlbum = async (album: AlbumCreate) => {
    await axios.post(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album`,
      album
    );
    refetch();
  };

  // Update album only if there is a difference
  const updateAlbum = async (id: string, album: AlbumUpdate) => {
    const currentAlbum = albumsDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(currentAlbum, album);
    if (isEmpty) return;

    await axios.put(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album/${id}`,
      changes
    );
    refetch();
  };

  // Delete album
  const deleteAlbum = async (id: string) => {
    await axios.delete(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album/${id}`
    );
    refetch();
  };

  return {
    albumsData,
    albumsDataById,
    albumData,
    addAlbum,
    updateAlbum,
    status,
    deleteAlbum,
  };
}
