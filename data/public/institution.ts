import { useMemo } from "react";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

interface InstitutionData {
  id: string;
  name: string;
}

// Custom hook to fetch and manage institutions data
export function useInstitutions(): {
  institutionsData: InstitutionData[];
  status: string;
} {
  // Fetch institutions data using custom query hook
  const { data, status, isLoading } = useQueryFetch(
    ["public", "getInstitutions"],
    "public/getInstitutions"
  );

  const institutionsQueryData = data?.data as InstitutionData[];

  // Memoize institutions data with additional formatting
  const institutionsData = useMemo(() => {
    if (!isLoading && institutionsQueryData) {
      const mapData = institutionsQueryData.map((data) => {
        return {
          ...data,
        };
      });

      return mapData;
    } else return [];
  }, [institutionsQueryData, isLoading]);

  return {
    institutionsData,
    status,
  };
}
