import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface AlbumData {
  id: string;
  name: string;
  description: string;
  type: string;
  institution_id: string;
  course_id: string;
  created_at: Date;
  updated_at: Date;
  photos: { name: string; download_url: string; display_url: string }[];

  created_by_name: string;
  updated_by_name: string;
}

export interface AlbumCreate {
  name: string;
  description: string;
  type: string;
  institution_id?: string;
  course_id?: string;
}

type AlbumUpdate = Partial<AlbumCreate>;

export function useAlbums(
  institutionId: string,
  academicYearId: string,
  courseId: string,
  albumId?: string
): {
  albumsData: AlbumData[];
  albumsDataById: Record<string, AlbumData>;
  albumData: AlbumData | undefined;
  addAlbum: (album: AlbumCreate) => Promise<void>;
  updateAlbum: (id: string, album: AlbumUpdate) => Promise<void>;
  status: string;
} {
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

  const albumsQueryData = data as AlbumData[];

  // Memoize albums data
  const albumsData = useMemo(() => {
    if (!isLoading && albumsQueryData) {
      const mapData = albumsQueryData.map((data) => {
        return {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        };
      });

      return mapData;
    } else return [];
  }, [albumsQueryData, isLoading]);

  // Memoize albums data by id
  const albumsDataById = useMemo(() => {
    return keyBy(albumsData, "id");
  }, [albumsData]);

  // Get specific album data by albumId
  const albumData = albumId ? albumsDataById[albumId] : undefined;

  // Add album
  const addAlbum = async (album: AlbumCreate) => {
    await axios.post(
      `admin/institution/${institutionId}/course/${courseId}/album`,
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
      `admin/institution/${institutionId}/course/${courseId}/album/${id}`,
      changes
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
  };
}
