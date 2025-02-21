import { useMemo } from "react";
import keyBy from "lodash/keyBy";
import { useQueryFetch } from "@/helpers/queryHelpers";
import axios from "@/utils/axios";
import { useParams } from "next/navigation";

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
  status: string;
} {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;

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
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [packagesQueryData, isLoading]);

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

  return {
    packagesData,
    packagesById,
    status,
    packageData,
    addPackage,
    updatePackage,
  };
}
