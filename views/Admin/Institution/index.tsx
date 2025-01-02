import Link from "next/link";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { Page } from "@/components/Box";
import AddEditInstitutionDialog from "./AddEditInstitutionDialog";

//*mui
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";

function Institution() {
  //*data
  const { institutionsData, status } = useInstitutions();

  //*const
  const columns: GridColDef<(typeof institutionsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue, id }) => {
        return <Link href={`/admin/institution/${id}`}>{formattedValue}</Link>;
      },
    },
    {
      field: "code",
      headerName: "Code",
      width: 150,
    },
    {
      field: "type_name_format",
      headerName: "Type",
      width: 200,
    },
    {
      field: "created_by_name",
      headerName: "Created By",
      width: 200,
    },
    {
      field: "created_at",
      headerName: "Created At",
      type: "date",
      width: 100,
    },
    {
      field: "button",
      headerName: "",
      renderCell: ({ id }) => {
        return (
          <AddEditInstitutionDialog mode="edit" institutionId={id as string} />
        );
      },
      minWidth: 100,
    },
  ];

  return (
    <Page
      leftButton={[]}
      links={[{ href: "/admin/institution", title: "Institutions" }]}
      rightButton={[
        <AddEditInstitutionDialog key="AddEditInstitutionDialog" />,
      ]}
      isLoading={status === "pending"}
    >
      <DataGrid
        gap={16}
        data={institutionsData}
        columns={columns}
        loading={status === "pending"}
      />
    </Page>
  );
}

export default Institution;
