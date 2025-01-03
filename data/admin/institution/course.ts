import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";
import find from "lodash/find";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface CourseData {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  standard_id: string;
  institution_id: string;
  academic_year_id: string;
  access_code: string;
  created_at: Date;
  updated_at: Date;
  standard: { name: string };
  valid_period: "MONTH" | "QUARTER" | "HALF" | "YEAR" | "CUSTOM";

  standard_name_format: string;
  valid_period_format: string;
}

export const validPeriodOptions = [
  { value: "MONTH", label: "1 Month" },
  { value: "QUARTER", label: "3 Months" },
  { value: "HALF", label: "6 Months" },
  { value: "YEAR", label: "1 Year" },
  { value: "CUSTOM", label: "Custom" },
];

export interface CourseCreate {
  name: string;
  access_code: string;
  standard_id: string;
  start_date: Date;
  end_date: Date;
  valid_period: string;
}

type CourseUpdate = Partial<CourseCreate>;

export function useCourses(
  institutionId: string,
  academicYearId: string,
  courseId?: string
): {
  coursesData: CourseData[];
  coursesDataById: Record<string, CourseData>;
  courseData: CourseData | undefined;
  addCourse: (course: CourseCreate) => Promise<void>;
  updateCourse: (id: string, course: CourseUpdate) => Promise<void>;
  status: string;
} {
  // Fetch courses data
  const { data, status, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "institutions",
      institutionId,
      "academicYears",
      academicYearId,
      "courses",
    ],
    `admin/institution/${institutionId}/academicYear/${academicYearId}/course`
  );

  const coursesQueryData = data as CourseData[];

  // Memoize courses data
  const coursesData = useMemo(() => {
    if (!isLoading && coursesQueryData) {
      const mapData = coursesQueryData.map((data) => {
        return {
          ...data,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),

          standard_name_format: data.standard.name,
          valid_period_format: find(validPeriodOptions, {
            value: data.valid_period,
          })?.label,
        };
      });

      return mapData;
    } else return [];
  }, [coursesQueryData, isLoading]);

  // Memoize courses data by id
  const coursesDataById = useMemo(() => {
    return keyBy(coursesData, "id");
  }, [coursesData]);

  // Get specific course data by courseId
  const courseData = courseId ? coursesDataById[courseId] : undefined;

  // Add course
  const addCourse = async (course: CourseCreate) => {
    await axios.post(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course`,
      course
    );
    refetch();
  };

  // Update course only if there is a difference
  const updateCourse = async (id: string, course: CourseUpdate) => {
    const currentCourse = coursesDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(currentCourse, course);
    if (isEmpty) return;

    await axios.put(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${id}`,
      changes
    );
    refetch();
  };

  return {
    coursesData,
    coursesDataById,
    courseData,
    addCourse,
    updateCourse,
    status,
  };
}
