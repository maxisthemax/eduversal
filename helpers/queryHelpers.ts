import { useQuery, keepPreviousData, QueryKey } from "@tanstack/react-query";

//*utils
import axios from "@/utils/axios";

export function useQueryFetch(
  queryKey: QueryKey,
  queryUrl: string,
  option?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchIntervalInBackground?: boolean;
    refetchInterval?: number;
    refetchOnMount?: boolean;
    isKeepPreviousData?: boolean;
  }
) {
  const enabled = option?.enabled ?? true;
  const refetchInterval = option?.refetchInterval ?? 0;
  const refetchIntervalInBackground =
    option?.refetchIntervalInBackground ?? false;
  const refetchOnWindowFocus = option?.refetchOnWindowFocus ?? false;
  const refetchOnMount = option?.refetchOnMount ?? false;
  const isKeepPreviousData = option?.isKeepPreviousData ?? false;

  const fetchFn = async () => {
    try {
      const res = await axios.get(queryUrl);
      return {
        data: res.data,
        currentPage: res.currentPage,
        totalCount: res.totalCount,
        type: res.type,
        message: res.message,
      };
    } catch (error) {
      return error;
    }
  };
  const result = useQuery({
    queryKey: queryKey,
    queryFn: fetchFn,
    enabled: enabled,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    refetchOnMount,
    ...(isKeepPreviousData ? { placeholderData: keepPreviousData } : {}),
  });

  return result;
}
