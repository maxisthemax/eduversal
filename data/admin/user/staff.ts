import { useMemo } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*utils
import axios from "@/utils/axios";

//*interface
import { PermissionsData } from "@/data/user";
export interface StaffData {
  id: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
  country_code: string;
  phone_no: string;
  permissions: PermissionsData;

  contact_number_format: string;
}

export function useStaff(): {
  staffData: StaffData[];
  staffDataById: Record<string, StaffData>;
  status: string;
  updateUserRole: (
    role: "USER" | "ADMIN",
    userId?: string,
    email?: string
  ) => Promise<string>;
  updateUserPermissions: (
    staffId: string,
    permissions: PermissionsData
  ) => Promise<void>;
} {
  // Fetch staff data
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "user", "staff"],
    `admin/user/staff`
  );

  const staffQueryData = data?.data as StaffData[];

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

  // Update standard only if there is a difference
  const updateUserRole = async (
    role: "USER" | "ADMIN",
    userId?: string,
    email?: string
  ): Promise<string> => {
    const res = await axios.post(`admin/user/staff`, { role, userId, email });
    refetch();
    return res.data.staffId;
  };

  const updateUserPermissions = async (
    staffId: string,
    permissions: PermissionsData
  ) => {
    await axios.post("admin/user/updateStaffPermissions", {
      staffId,
      permissions,
    });
    refetch();
  };

  return {
    staffData,
    staffDataById,
    status,
    updateUserRole,
    updateUserPermissions,
  };
}
