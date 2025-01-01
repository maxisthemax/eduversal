import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";
import AddEditAcademicYearDialog from "./AddEditAcademicYearDialog";

//*mui
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/institutions/institutions";
import { useAcademicYears } from "@/data/institutions/academicYear";

function AcademicYear() {
  const params = useParams();
  const institutionId = params.institutionid as string;
  const { institutionData, status } = useInstitutions(institutionId);
  const { academicYearsData } = useAcademicYears(institutionId);

  //*const
  const columns: GridColDef<(typeof academicYearsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 1,
    },
    {
      field: "start_date",
      headerName: "Start Date",
      type: "date",
      flex: 1,
    },
    {
      field: "end_date",
      headerName: "End Date",
      type: "date",
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
    {
      field: "button",
      headerName: "",
      renderCell: ({ id }) => {
        return (
          <AddEditAcademicYearDialog
            mode="edit"
            academicYearId={id as string}
          />
        );
      },
      minWidth: 100,
    },
  ];

  return (
    <Page
      isLoading={status === "pending"}
      links={[
        { href: "/admin/institution", title: "Institutions" },
        {
          href: `/admin/institution/${institutionId}`,
          title: institutionData?.name,
        },
      ]}
      leftButton={[]}
      rightButton={[
        <AddEditAcademicYearDialog key="addEditAcademicYearDialog" />,
      ]}
    >
      <DataGrid gap={16} columns={columns} data={academicYearsData} />
    </Page>
  );
}

export default AcademicYear;
