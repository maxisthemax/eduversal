import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
interface InstitutionType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionData {
  id: string;
  name: string;
  type_id: string;
  code: string;
  type: InstitutionType;
  created_at: Date;
  updated_at: Date;

  type_name_format?: string;
}

export interface InstitutionCreate {
  name: string;
  type_id: string;
  code: string;
}

export function useInstitutions(institutionId?: string): {
  institutionsData: InstitutionData[];
  institutionsDataById: Record<string, InstitutionData>;
  institutionData: InstitutionData;
  addInstitution: (institution: InstitutionCreate) => Promise<void>;
  status: string;
} {
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "institutions"],
    "admin/institutions"
  );

  const institutionsData = data as InstitutionData[];

  const institutionsDataMemo = useMemo(() => {
    if (!isLoading && institutionsData) {
      const mapData = institutionsData.map((data) => {
        return {
          ...data,
          type_name_format: data.type.name,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        };
      });

      return mapData;
    } else return [];
  }, [institutionsData, isLoading]);

  const institutionsDataById = useMemo(() => {
    return keyBy(institutionsDataMemo, "id");
  }, [institutionsDataMemo]);

  const institutionData = institutionsDataById[institutionId];

  //*Add institution
  const addInstitution = async (institution: InstitutionCreate) => {
    await axios.post("admin/institutions", institution);
    refetch();
  };

  return {
    institutionsData: institutionsDataMemo,
    institutionsDataById,
    institutionData,
    addInstitution,
    status,
  };
}
