import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";
import AddEditAcademicYearDialog from "./AddEditAcademicYearDialog";

//*mui
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import Link from "next/link";

function AcademicYear() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const { institutionData, status } = useInstitutions(institutionId);
  const { academicYearsData } = useAcademicYears(institutionId);

  //*const
  const columns: GridColDef<(typeof academicYearsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue, id }) => {
        return (
          <Link href={`/admin/institution/${institutionId}/${id}`}>
            {formattedValue}
          </Link>
        );
      },
    },
    {
      field: "year",
      headerName: "Year",
      width: 100,
    },
    {
      field: "start_date",
      headerName: "Start Date",
      type: "date",
      width: 100,
    },
    {
      field: "end_date",
      headerName: "End Date",
      type: "date",
      width: 100,
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
