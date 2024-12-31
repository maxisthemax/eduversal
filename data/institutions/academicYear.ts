import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface AcademicYearData {
  id: string;
  name: string;
  year: number;
  start_date: Date;
  end_date: Date;
  institution_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface AcademicYearCreate {
  name: string;
  year: number;
  start_date: Date;
  end_date: Date;
}

export function useAcademicYears(
  institutionId: string,
  academicYearId?: string
): {
  academicYearsData: AcademicYearData[];
  academicYearsDataById: Record<string, AcademicYearData>;
  academicYearData: AcademicYearData;
  addAcademicYear: (academicYear: AcademicYearCreate) => Promise<void>;
  status: string;
} {
  // Fetch academic years data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "institutions", institutionId, "academicYears"],
    `admin/institutions/${institutionId}/academicYears`
  );

  const academicYearsQueryData = data as AcademicYearData[];

  // Memoize academic years data
  const academicYearsData = useMemo(() => {
    if (!isLoading && academicYearsQueryData) {
      const mapData = academicYearsQueryData.map((data) => {
        return {
          ...data,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        };
      });

      return mapData;
    } else return [];
  }, [academicYearsQueryData, isLoading]);

  // Memoize academic years data by id
  const academicYearsDataById = useMemo(() => {
    return keyBy(academicYearsData, "id");
  }, [academicYearsData]);

  // Get specific academic year data by institutionId
  const academicYearData = academicYearsDataById[academicYearId];

  // Add academic year
  const addAcademicYear = async (academicYear: AcademicYearCreate) => {
    await axios.post(`admin/institutions/${institutionId}/academicYears`, {
      ...academicYear,
      institution_id: institutionId,
    });
    refetch();
  };

  return {
    academicYearsData,
    academicYearsDataById,
    academicYearData,
    addAcademicYear,
    status,
  };
}
