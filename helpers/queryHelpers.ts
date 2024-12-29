import { useQuery } from "@tanstack/react-query";

//*utils
import axios from "@/utils/axios";

export function useQueryFetch(
  queryKey: (string | number)[],
  queryUrl: string,
  enabled = true,
  refetchOnWindowFocus = false,
  refetchIntervalInBackground = false,
  refetchInterval: number | false = false,
  refetchOnMount = true
) {
  const fetchFn = async () => {
    const res = await axios.get(queryUrl);
    return res.data;
  };
  const result = useQuery({
    queryKey: queryKey,
    queryFn: fetchFn,
    enabled: enabled,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    refetchOnMount,
  });

  return result;
}
