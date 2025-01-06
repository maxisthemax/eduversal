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
export interface PhotoData {
  id: string;
  name: string;
  download_url: string;
  display_url: string;
  created_by_name: string;
  updated_by_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface PhotoCreate {
  name: string;
  download_url: string;
  display_url: string;
}

type PhotoUpdate = Partial<PhotoCreate>;

export function usePhotos(
  albumId: string,
  photoId?: string
): {
  photosData: PhotoData[];
  photosDataById: Record<string, PhotoData>;
  photoData: PhotoData | undefined;
  addPhoto: (photos: PhotoCreate[]) => Promise<void>;
  updatePhoto: (id: string, photo: PhotoUpdate) => Promise<void>;
  status: string;
} {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;

  // Fetch photos data
  const { data, status, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "institutions",
      institutionId,
      "academicYears",
      academicYearId,
      "courses",
      courseId,
      "album",
      albumId,
    ],
    `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album/${albumId}/photo`
  );

  const photosQueryData = data as PhotoData[];

  // Memoize photos data
  const photosData = useMemo(() => {
    if (!isLoading && photosQueryData) {
      return photosQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [photosQueryData, isLoading]);

  // Memoize photos data by id
  const photosDataById = useMemo(() => keyBy(photosData, "id"), [photosData]);

  // Get specific photo data by photoId
  const photoData = photoId ? photosDataById[photoId] : undefined;

  // Add photo
  const addPhoto = async (photos: PhotoCreate[]) => {
    await axios.post(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album/${albumId}/photo`,
      { photos }
    );
    refetch();
  };

  // Update photo only if there is a difference
  const updatePhoto = async (id: string, photo: PhotoUpdate) => {
    const currentPhoto = photosDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(currentPhoto, photo);
    if (isEmpty) return;

    await axios.put(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${courseId}/album/${albumId}/photo/${id}`,
      changes
    );
    refetch();
  };

  return {
    photosData,
    photosDataById,
    photoData,
    addPhoto,
    updatePhoto,
    status,
  };
}
