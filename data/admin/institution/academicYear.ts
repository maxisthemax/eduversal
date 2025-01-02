import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

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

type AcademicYearUpdate = Partial<AcademicYearCreate>;

export function useAcademicYears(
  institutionId: string,
  academicYearId?: string
): {
  academicYearsData: AcademicYearData[];
  academicYearsDataById: Record<string, AcademicYearData>;
  academicYearData: AcademicYearData;
  addAcademicYear: (academicYear: AcademicYearCreate) => Promise<void>;
  updateAcademicYear: (
    id: string,
    academicYear: AcademicYearUpdate
  ) => Promise<void>;
  status: string;
} {
  // Fetch academic years data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "institutions", institutionId, "academicYears"],
    `admin/institution/${institutionId}/academicYear`
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
    await axios.post(`admin/institution/${institutionId}/academicYear`, {
      ...academicYear,
    });
    refetch();
  };

  // Update academic year only if there is a difference
  const updateAcademicYear = async (
    id: string,
    academicYear: AcademicYearUpdate
  ) => {
    const currentAcademicYear = academicYearsDataById[id];

    // Remove fields that have the same value]
    const { changes, isEmpty } = checkSameValue(
      currentAcademicYear,
      academicYear
    );
    if (isEmpty) return;

    await axios.put(
      `admin/institution/${institutionId}/academicYear/${id}`,
      changes
    );
    refetch();
  };

  return {
    academicYearsData,
    academicYearsDataById,
    academicYearData,
    addAcademicYear,
    updateAcademicYear,
    status,
  };
}
