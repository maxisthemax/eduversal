import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";
import { checkSameValue } from "@/helpers/objectHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
export interface StandardData {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface StandardCreate {
  name: string;
}

type StandardUpdate = Partial<StandardCreate>;

export function useStandard(): {
  standardsData: StandardData[];
  standardsDataById: Record<string, StandardData>;
  addStandard: (standard: StandardCreate) => Promise<void>;
  updateStandard: (id: string, standard: StandardUpdate) => Promise<void>;
  status: string;
} {
  // Fetch standards data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "setting", "standard"],
    `admin/setting/standard`
  );

  const standardsQueryData = data?.data as StandardData[];

  // Memoize standards data
  const standardsData = useMemo(() => {
    if (!isLoading && standardsQueryData) {
      return standardsQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }));
    } else return [];
  }, [standardsQueryData, isLoading]);

  // Memoize standards data by id
  const standardsDataById = useMemo(() => {
    return keyBy(standardsData, "id");
  }, [standardsData]);

  // Add standard
  const addStandard = async (standard: StandardCreate) => {
    await axios.post(`admin/setting/standard`, standard);
    refetch();
  };

  // Update standard only if there is a difference
  const updateStandard = async (id: string, standard: StandardUpdate) => {
    const currentStandard = standardsDataById[id];

    // Remove fields that have the same value
    const { changes, isEmpty } = checkSameValue(currentStandard, standard);
    if (isEmpty) return;

    await axios.put(`admin/setting/standard/${id}`, changes);
    refetch();
  };

  return {
    standardsData,
    standardsDataById,
    addStandard,
    updateStandard,
    status,
  };
}
