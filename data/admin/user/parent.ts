import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*mui
import { GridFilterModel } from "@mui/x-data-grid";

//*interface
import { UserData } from "@/data/user";

//*utils
import axios from "@/utils/axios";

export interface ParentData extends UserData {
  contact_number_format: string;
}

export function useParent(): {
  parentData: ParentData[];
  parentDataById: Record<string, ParentData>;
  status: string;
  pagination?: {
    currentPage: number;
    totalCount: number;
    pageModel: { page: number; pageSize: number };
    setPageModel: React.Dispatch<
      React.SetStateAction<{ page: number; pageSize: number }>
    >;
  };
  filter?: {
    filterModel: GridFilterModel;
    setFilterModel: React.Dispatch<React.SetStateAction<GridFilterModel>>;
  };
  disabledUser: (id: string, isDisabled: boolean) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
} {
  const [pageModel, setPageModel] = useState({ page: 0, pageSize: 100 });
  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  // Fetch parent data with pagination
  const searchQuery = filterModel?.quickFilterValues?.[0] || undefined;
  const { data, status, isLoading, refetch } = useQueryFetch(
    ["admin", "user", "parent", "page", pageModel.page, searchQuery],
    `admin/user/parent?page=${pageModel.page}&pageSize=${pageModel.pageSize}${
      searchQuery ? `&search=${searchQuery}` : ""
    }`,
    { isKeepPreviousData: true }
  );

  const parentQueryData = data?.data as ParentData[];
  const currentPage = data?.currentPage || 0;
  const totalCount = data?.totalCount || 0;

  // Memoize parent data
  const parentData = useMemo(() => {
    if (!isLoading && parentQueryData) {
      return parentQueryData.map((data) => ({
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        contact_number_format: data.country_code + data.phone_no,
        address_format: `${data?.address_1}${
          data.address_2 ? ", \n" + data.address_2 : ""
        },\n${data.postcode}, ${data.city}, ${data.state}`,
      }));
    } else return [];
  }, [parentQueryData, isLoading]);

  // Memoize parent data by id
  const parentDataById = useMemo(() => {
    return keyBy(parentData, "id");
  }, [parentData]);

  const disabledUser = async (id: string, isDisabled: boolean) => {
    await axios.post("/admin/user/disabledUser", {
      staffId: id,
      is_disabled: isDisabled,
    });
    refetch();
  };

  const approveUser = async (id: string) => {
    await axios.post("/admin/user/manualVerifyUser", {
      parentId: id,
    });
    refetch();
  };

  return {
    parentData,
    parentDataById,
    status,
    pagination: { currentPage, totalCount, pageModel, setPageModel },
    filter: { filterModel, setFilterModel },
    disabledUser,
    approveUser,
  };
}
