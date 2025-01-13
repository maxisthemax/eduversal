import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

//*utils
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
interface UserData {
  id: number;
  name: string;
  email: string;
  address_1: string;
  address_2: string | null;
  city: string;
  country_code: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  postcode: string;
  role: string;
  state: string;
}

export const useUser = () => {
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const { data, status, isError } = useQueryFetch(["user"], "user");

  const userData = data as UserData;

  useEffect(() => {
    if (isError) {
      queryClient.clear();
      push("/signin");
    }
  }, [isError]);

  return { data: userData, status };
};
