import { useParams } from "next/navigation";
import Link from "next/link";

//*components
import { Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";
import AddEditCourseDialog from "./AddEditCourseDialog";

//*mui
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";

function AcademicYear() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearData, status: academicYearStatus } = useAcademicYears(
    institutionId,
    academicYearId
  );
  const { coursesData, status: coursesStatus } = useCourses(
    institutionId,
    academicYearId
  );

  //*const
  const columns: GridColDef<(typeof coursesData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue, id }) => {
        return (
          <Link
            href={`/admin/institution/${institutionId}/${academicYearId}/${id}`}
          >
            {formattedValue}
          </Link>
        );
      },
    },
    {
      field: "standard_name_format",
      headerName: "Standard",
      width: 200,
    },
    {
      field: "access_code",
      headerName: "Access Code",
      width: 200,
    },
    {
      field: "valid_period_format",
      headerName: "Valid Period",
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
        return <AddEditCourseDialog mode="edit" courseId={id as string} />;
      },
      minWidth: 100,
    },
  ];

  return (
    <Page
      isLoading={
        institutionStatus === "pending" ||
        academicYearStatus === "pending" ||
        coursesStatus === "pending"
      }
      links={[
        { href: "/admin/institution", title: "Institutions" },
        {
          href: `/admin/institution/${institutionId}`,
          title: institutionData?.name,
        },
        {
          href: `/admin/institution/${institutionId}/${academicYearId}`,
          title: academicYearData?.name,
        },
      ]}
      leftButton={[]}
      rightButton={[<AddEditCourseDialog key="addEditAcademicYearDialog" />]}
    >
      <DataGrid gap={16} columns={columns} data={coursesData} />
    </Page>
  );
}

export default AcademicYear;
