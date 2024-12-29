//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*interface
interface InstitutionType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  type_id: string;
  type_name_format: string;
  created_at: Date;
  updated_at: Date;
}

export const useInstitutions = () => {
  const { data, status } = useQueryFetch(
    ["admin", "institutions"],
    "admin/institutions"
  );

  const institutionsData = data as Institution[];
  const institutionsDataMemo = institutionsData?.map((institution) => ({
    ...institution,
    type_name_format: institution.type.name,
    created_at: new Date(institution.created_at),
    updated: new Date(institution.updated_at),
  }));

  return { data: institutionsDataMemo, status };
};
