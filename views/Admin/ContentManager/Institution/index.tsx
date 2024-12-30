import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";

//*mui
import Button from "@mui/material/Button";

//*data
import { useInstitutions } from "@/data/institutions/institutions";
import { useAcademicYears } from "@/data/institutions/academicYear";
import { GridColDef } from "@mui/x-data-grid";

function Institution() {
  const params = useParams();
  const institutionid = params.institutionid as string;
  const { institutionData, status } = useInstitutions(institutionid);
  const { academicYearsData } = useAcademicYears(institutionid);

  //*const
  const columns: GridColDef<(typeof academicYearsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "year",
      headerName: "year",
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
  ];

  return (
    <Page
      isLoading={status === "pending"}
      links={[
        { href: "/admin/contentmanager", title: "Institutions" },
        {
          href: `/admin/contentmanager/${institutionid}`,
          title: institutionData?.name,
        },
      ]}
      leftButton={[]}
      rightButton={[
        <Button variant="contained" key="addAcademyYear">
          Add Academy Year
        </Button>,
      ]}
    >
      <DataGrid gap={16} columns={columns} data={academicYearsData} />
    </Page>
  );
}

export default Institution;
