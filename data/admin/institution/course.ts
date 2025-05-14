import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { isAfter } from "date-fns";

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
  force_disable: boolean;
  created_at: Date;
  updated_at: Date;
  standard: { name: string };
  valid_period: "MONTH" | "QUARTER" | "HALF" | "YEAR" | "CUSTOM";
  standard_name_format: string;
  valid_period_format: string;
  access_code_status: string;
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
  force_disable?: boolean;
}

type CourseUpdate = Partial<CourseCreate>;

export function useCourses(
  courseId?: string,
  otherParams?: { academicYearId?: string; institutionId?: string }
): {
  coursesData: CourseData[];
  coursesDataById: Record<string, CourseData>;
  courseData: CourseData | undefined;
  addCourse: (course: CourseCreate) => Promise<void>;
  updateCourse: (id: string, course: CourseUpdate) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  status: string;
  isDeleting: boolean;
} {
  const params = useParams();
  const academicYearId =
    (params.academicYearId as string) ?? otherParams?.academicYearId;
  const institutionId =
    (params.institutionId as string) ?? otherParams?.institutionId;

  const [isDeleting, setIsDeleting] = useState(false);

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
    `admin/institution/${institutionId}/academicYear/${academicYearId}/course`,
    {
      enabled:
        institutionId !== undefined &&
        institutionId !== "" &&
        academicYearId !== undefined &&
        academicYearId !== "",
    }
  );

  const coursesQueryData = data?.data as CourseData[];

  // Memoize courses data
  const coursesData = useMemo(() => {
    if (!isLoading && coursesQueryData) {
      return coursesQueryData.map((data) => {
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
          access_code_status:
            data.force_disable || isAfter(new Date(), new Date(data.end_date))
              ? "Disabled"
              : "Enabled",
        };
      });
    } else return [];
  }, [coursesQueryData, isLoading]);

  // Memoize courses data by id
  const coursesDataById = useMemo(
    () => keyBy(coursesData, "id"),
    [coursesData]
  );

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

  // Delete course
  const deleteCourse = async (id: string) => {
    setIsDeleting(true);
    await axios.delete(
      `admin/institution/${institutionId}/academicYear/${academicYearId}/course/${id}`
    );
    refetch();
    setIsDeleting(false);
  };

  return {
    coursesData,
    coursesDataById,
    courseData,
    addCourse,
    updateCourse,
    status,
    deleteCourse,
    isDeleting,
  };
}
