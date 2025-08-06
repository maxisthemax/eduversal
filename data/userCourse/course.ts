import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";
import startsWith from "lodash/startsWith";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*data
import { useUser } from "@/data/user";
import { ProductTypeData } from "../admin/productType";
import { ProductVariationData } from "../admin/productVariation";
import { PackageData } from "../admin/institution/packages";

//*helpers
import { expandByQuantity } from "@/helpers/arrayHelpers";

export interface UserCoursePackageData extends PackageData {
  expandedAlbums: UserCourseAlbumData[];
}

//*interface
export interface UserCoursePhotoData {
  id: string;
  name: string;
  display_url: string;
  download_url: string;
}

export interface UserCourseAlbumData {
  albumProductVariations: {
    productVariation: ProductVariationData;
    mandatory: boolean;
    disabled_options: string[];
    productVariation_id: string;
  }[];
  product_type: ProductTypeData;
  preview_url: string;
  photos: UserCoursePhotoData[];
  name: string;
  description: string;
  id: string;
}

export interface UserCourseData {
  id: string;
  names: string[];
  course_id: string;
  course: {
    id: string;
    academicYear: {
      id: string;
      year: number;
      name: string;
    };
    name: string;
    standard: {
      id: string;
      name: string;
    };
    albums: UserCourseAlbumData[];
    package: UserCoursePackageData[];
    end_date: string;
    institution: { id: string; name: string };
  };
  title_format: string;
  institution_id?: string;
  institution_name?: string;
  academic_year_id?: string;
  academic_year_name?: string;
  course_name?: string;
}

export function useUserCourse(userCourseId?: string): {
  userCoursesData: UserCourseData[];
  userCourseData: UserCourseData;
  userCoursesDataById: Record<string, UserCourseData>;
  status: string;
  addUserCourse: (child: string[], course_id: string) => Promise<void>;
  isAdding: boolean;
  updateUserCourse: (child: string[], user_course_id: string) => Promise<void>;
  isUpdating: boolean;
} {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // Fix typo in function name
  const { data: userData } = useUser();

  // Fetch user courses data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["userCourse", userData?.id],
    `userCourse`
  );

  const userCoursesQueryData = data?.data as UserCourseData[];

  // Memoize user courses data
  const userCoursesData = useMemo(() => {
    if (!isLoading && userCoursesQueryData) {
      return userCoursesQueryData.map((data) => {
        const albums = data.course.albums.map((album) => ({
          ...album,
          albumProductVariations: album.albumProductVariations.map(
            (albumProductVariation) => ({
              ...albumProductVariation,
              productVariation: {
                ...albumProductVariation.productVariation,
                options: albumProductVariation.productVariation.options.map(
                  (option) => ({
                    ...option,
                    price_format:
                      option.currency + " " + option.price.toFixed(2),
                  })
                ),
              },
            })
          ),
        }));
        return {
          ...data,
          title_format: data.course.name + " - " + data.course.standard.name,
          course: {
            ...data.course,
            albums,
            package: data.course.package.map((pack) => ({
              ...pack,
              preview_url: `${
                startsWith(pack.preview_url, "sgp1")
                  ? "https://" + pack.preview_url
                  : pack.preview_url
              }`,
              price_format: pack.currency + " " + pack.price.toFixed(2),
              package_type_format: pack.packageAlbums
                .map(({ album_id, quantity }) => {
                  const album = data.course.albums.find(
                    (album) => album.id === album_id
                  );
                  return `${quantity} ${album.name} `;
                })
                .join(" + "),
              expandedAlbums: expandByQuantity(pack.packageAlbums).map(
                ({ album_id }) => {
                  const album = albums.find((album) => album.id === album_id);
                  return {
                    ...album,
                  };
                }
              ),
            })),
          },
          institution_id: data.course.institution.id,
          institution_name: data.course.institution.name,
          academic_year_id: data.course.academicYear.id,
          academic_year_name:
            data.course.academicYear.name +
            ` (${data.course.academicYear.year.toString()})`,
        };
      });
    } else return [];
  }, [userCoursesQueryData, isLoading]);

  // Memoize user courses data by id
  const userCoursesDataById = useMemo(
    () => keyBy(userCoursesData, "id"),
    [userCoursesData]
  );

  const userCourseData = userCoursesDataById[userCourseId];

  // functions
  async function addUserCourse(child: string[], course_id: string) {
    setIsAdding(true);
    await axios.post(`userCourse`, {
      names: child,
      course_id,
    });
    refetch();
    setIsAdding(false);
  }

  async function updateUserCourse(child: string[], user_course_id: string) {
    setIsUpdating(true);
    await axios.put(`userCourse`, {
      names: child,
      user_course_id,
    });
    refetch();
    setIsUpdating(false);
  }

  return {
    userCoursesData,
    userCoursesDataById,
    userCourseData,
    status,
    addUserCourse,
    isAdding,
    updateUserCourse,
    isUpdating,
  };
}
