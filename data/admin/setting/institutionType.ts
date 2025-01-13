import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface InstitutionTypeData {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface InstitutionTypeCreate {
  name: string;
}

type InstitutionTypeUpdate = Partial<InstitutionTypeCreate>;

export function useInstitutionTypes(): {
  institutionTypesData: InstitutionTypeData[];
  institutionTypesDataById: Record<string, InstitutionTypeData>;
  addInstitutionType: (institutionType: InstitutionTypeCreate) => Promise<void>;
  updateInstitutionType: (
    id: string,
    institutionType: InstitutionTypeUpdate
  ) => Promise<void>;
  status: string;
} {
  // Fetch institution types data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "setting", "institutionType"],
    `admin/setting/institutionType`
  );

  const institutionTypesQueryData = data?.data as InstitutionTypeData[];

  // Memoize institution types data
  const institutionTypesData = useMemo(() => {
    if (!isLoading && institutionTypesQueryData) {
      return institutionTypesQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [institutionTypesQueryData, isLoading]);

  // Memoize institution types data by id
  const institutionTypesDataById = useMemo(() => {
    return keyBy(institutionTypesData, "id");
  }, [institutionTypesData]);

  // Add institution type
  const addInstitutionType = async (institutionType: InstitutionTypeCreate) => {
    await axios.post(`admin/setting/institutionType`, institutionType);
    refetch();
  };

  // Update institution type only if there is a difference
  const updateInstitutionType = async (
    id: string,
    institutionType: InstitutionTypeUpdate
  ) => {
    const currentInstitutionType = institutionTypesDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(
      currentInstitutionType,
      institutionType
    );
    if (isEmpty) return;

    await axios.put(`admin/setting/institutionType/${id}`, changes);
    refetch();
  };

  return {
    institutionTypesData,
    institutionTypesDataById,
    addInstitutionType,
    updateInstitutionType,
    status,
  };
}
