import { useMemo } from "react";
import { useParams } from "next/navigation";

//*lodash
import keyBy from "lodash/keyBy";
import startsWith from "lodash/startsWith";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*data
import { useAlbums } from "./album";

//*interface
export interface PackageData {
  id: string;
  name: string;
  description: string;
  is_downloadable: boolean;
  preview_url: string;
  preview_url_key: string;
  currency: string;
  price: number;
  packageAlbums: {
    album_id: string;
    quantity: number;
  }[];

  price_format: string;
  package_type_format: string;
  created_at: Date;
  updated_at: Date;
}

export interface PackageCreate {
  name: string;
  description?: string;
  is_downloadable: boolean;
  preview_url?: string;
  preview_url_key?: string;
  currency: string;
  price: number;
  albums: {
    album_id: string;
    quantity: number;
  }[];
}

type PackageUpdate = Partial<PackageCreate>;

export function usePackage(packageId?: string): {
  packagesData: PackageData[];
  packagesById: Record<string, PackageData>;
  packageData: PackageData;
  addPackage: (packageData: PackageCreate) => Promise<void>;
  updatePackage: (id: string, packageData: PackageUpdate) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  status: string;
} {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;
  const { albumsDataById } = useAlbums();

  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "institutions", institutionId, "courses", courseId, "package"],
    `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/package`
  );

  const packagesQueryData = data?.data as PackageData[];

  const packagesData = useMemo(() => {
    if (!isLoading && packagesQueryData) {
      return packagesQueryData.map((data) => ({
        ...data,
        price_format: data.currency + " " + data.price.toFixed(2),
        package_type_format: data.packageAlbums
          .map(({ album_id, quantity }) => {
            return `${quantity} ${albumsDataById[album_id].name} `;
          })
          .join(" + "),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        preview_url: `${
          startsWith(data.preview_url, "sgp1")
            ? "https://" + data.preview_url
            : data.preview_url
        }`,
      }));
    } else return [];
  }, [isLoading, packagesQueryData, albumsDataById]);

  const packagesById = useMemo(() => {
    return keyBy(packagesData, "id");
  }, [packagesData]);

  const packageData = packagesById[packageId];

  async function addPackage(packageData: PackageCreate) {
    await axios.post(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/package`,
      packageData
    );
    refetch();
  }

  const updatePackage = async (id: string, packageData: PackageUpdate) => {
    await axios.put(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/package/${id}`,
      packageData
    );
    refetch();
  };

  const deletePackage = async (id: string) => {
    await axios.delete(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/package/${id}`
    );
    refetch();
  };

  return {
    packagesData,
    packagesById,
    status,
    packageData,
    addPackage,
    updatePackage,
    deletePackage,
  };
}
