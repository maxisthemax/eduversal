import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

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

interface InstitutionCreate {
  name: string;
  type_id: string;
  code: string;
}

type InstitutionUpdate = Partial<InstitutionCreate>;

// Custom hook to fetch and manage institutions data
export function useInstitutions(institutionId?: string): {
  institutionsData: InstitutionData[];
  institutionsDataById: Record<string, InstitutionData>;
  institutionData: InstitutionData;
  addInstitution: (institution: InstitutionCreate) => Promise<void>;
  updateInstitution: (
    id: string,
    institution: InstitutionUpdate
  ) => Promise<void>;
  status: string;
  deleteInstitution: (id: string) => Promise<void>;
  isDeleting: boolean;
} {
  // Fetch institutions data using custom query hook
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "institutions"],
    "admin/institution"
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const institutionsQueryData = data?.data as InstitutionData[];

  // Memoize institutions data with additional formatting
  const institutionsData = useMemo(() => {
    if (!isLoading && institutionsQueryData) {
      const mapData = institutionsQueryData.map((data) => {
        return {
          ...data,
          type_name_format: data.type.name,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        };
      });

      return mapData;
    } else return [];
  }, [institutionsQueryData, isLoading]);

  // Memoize institutions data by ID
  const institutionsDataById = useMemo(() => {
    return keyBy(institutionsData, "id");
  }, [institutionsData]);

  // Get specific institution data by ID
  const institutionData = institutionsDataById[institutionId];

  // Add institution
  const addInstitution = async (institution: InstitutionCreate) => {
    await axios.post("admin/institution", institution);
    refetch();
  };

  // Update institution only if there is a difference
  const updateInstitution = async (
    id: string,
    institution: InstitutionUpdate
  ) => {
    const currentInstitution = institutionsDataById[id];

    // Remove fields that have the same value]
    const { changes, isEmpty } = checkSameValue(
      currentInstitution,
      institution
    );
    if (isEmpty) return;

    await axios.put(`admin/institution/${id}`, changes);
    refetch();
  };

  // Delete institution
  const deleteInstitution = async (id: string) => {
    setIsDeleting(true);
    await axios.delete(`admin/institution/${id}`);
    refetch();
    setIsDeleting(false);
  };

  return {
    institutionsData,
    institutionsDataById,
    institutionData,
    addInstitution,
    updateInstitution,
    status,
    deleteInstitution,
    isDeleting,
  };
}
