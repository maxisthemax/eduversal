import { useMemo, useState } from "react";

//*lodash
import keyBy from "lodash/keyBy";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*mui
import { GridFilterModel } from "@mui/x-data-grid";

//*interface
export interface ParentData {
  id: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
  country_code: string;
  phone_no: string;

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
} {
  const [pageModel, setPageModel] = useState({ page: 0, pageSize: 10 });
  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  // Fetch parent data with pagination
  const searchQuery = filterModel?.quickFilterValues?.[0] || undefined;
  const { data, status, isLoading } = useQueryFetch(
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
      }));
    } else return [];
  }, [parentQueryData, isLoading]);

  // Memoize parent data by id
  const parentDataById = useMemo(() => {
    return keyBy(parentData, "id");
  }, [parentData]);

  return {
    parentData,
    parentDataById,
    status,
    pagination: { currentPage, totalCount, pageModel, setPageModel },
    filter: { filterModel, setFilterModel },
  };
}
