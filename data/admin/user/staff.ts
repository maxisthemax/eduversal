import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
export interface StaffData {
  id: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
  country_code: string;
  phone_no: string;

  contact_number_format: string;
}

export function useStaff(): {
  staffData: StaffData[];
  staffDataById: Record<string, StaffData>;
  status: string;
} {
  // Fetch staff data
  const { data, status, isLoading } = useQueryFetch(
    ["admin", "user", "staff"],
    `admin/user/staff`
  );

  const staffQueryData = data as StaffData[];

  // Memoize staff data
  const staffData = useMemo(() => {
    if (!isLoading && staffQueryData) {
      return staffQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        contact_number_format: data.country_code + data.phone_no,
      }));
    } else return [];
  }, [staffQueryData, isLoading]);

  // Memoize staff data by id
  const staffDataById = useMemo(() => {
    return keyBy(staffData, "id");
  }, [staffData]);

  return {
    staffData,
    staffDataById,
    status,
  };
}
