import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*data
import { useUser } from "@/data/user";

//*interface
export interface UserCourseData {
  id: string;
  names: string[];
  course_id: string;
  course: {
    academicYear: {
      year: number;
    };
    name: string;
    standard: {
      name: string;
    };
    albums: {
      photos: [];
      name: string;
    }[];
    end_date: string;
  };
  title_format: string;
}

export function useUserCourse(): {
  userCoursesData: UserCourseData[];
  userCoursesDataById: Record<string, UserCourseData>;
  status: string;
  addUserCourse: (child: string[], course_id: string) => Promise<void>;
  isAdding: boolean;
  updateUserCourse: (child: string[], user_course_id: string) => Promise<void>;
  isUpdating: boolean;
} {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAddng] = useState(false);
  const { data: userData } = useUser();

  // Fetch user courses data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["userCourse", userData.id],
    `userCourse/${userData.id}`
  );

  const userCoursesQueryData = data?.data as UserCourseData[];

  // Memoize user courses data
  const userCoursesData = useMemo(() => {
    if (!isLoading && userCoursesQueryData) {
      return userCoursesQueryData.map((data) => ({
        ...data,
        title_format:
          data.course.name +
          " - " +
          data.course.standard.name +
          " (" +
          data.course.academicYear.year.toString() +
          ")",
      }));
    } else return [];
  }, [userCoursesQueryData, isLoading]);

  // Memoize user courses data by id
  const userCoursesDataById = useMemo(
    () => keyBy(userCoursesData, "id"),
    [userCoursesData]
  );

  // functions
  async function addUserCourse(child: string[], course_id: string) {
    setIsAddng(true);
    await axios.post(`userCourse/${userData.id}`, {
      names: child,
      course_id,
    });
    refetch();
    setIsAddng(false);
  }

  async function updateUserCourse(child: string[], user_course_id: string) {
    setIsUpdating(true);
    await axios.put(`userCourse/${userData.id}`, {
      names: child,
      user_course_id,
    });
    refetch();
    setIsUpdating(false);
  }

  return {
    userCoursesData,
    userCoursesDataById,
    status,
    addUserCourse,
    isAdding,
    updateUserCourse,
    isUpdating,
  };
}
