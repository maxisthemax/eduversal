import Link from "next/link";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { Page } from "@/components/Box";
import AddEditInstitutionDialog from "./AddEditInstitutionDialog";

//*mui
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/institutions";

function ContentManager() {
  //*data
  const { data, status } = useInstitutions();

  //*const
  const columns: GridColDef<(typeof data)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue, id }) => {
        return (
          <Link href={`/admin/contentmanager/${id}`}>{formattedValue}</Link>
        );
      },
    },
    {
      field: "code",
      headerName: "Code",
      flex: 1,
    },
    {
      field: "type_name_format",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "created_by_name",
      headerName: "Created By",
      flex: 1,
    },
    {
      field: "created_at",
      headerName: "Created At",
      type: "date",
      flex: 1,
    },
  ];

  return (
    <Page
      leftButton={[]}
      rightButton={[
        <AddEditInstitutionDialog key="AddEditInstitutionDialog" />,
      ]}
    >
      <DataGrid
        gap={17}
        data={data}
        columns={columns}
        loading={status === "pending"}
      />
    </Page>
  );
}

export default ContentManager;
