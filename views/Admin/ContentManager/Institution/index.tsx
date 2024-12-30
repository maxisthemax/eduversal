import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";

//*mui
import Button from "@mui/material/Button";

//*data
import { useInstitutions } from "@/data/institutions";

function Institution() {
  const params = useParams();
  const institutionid = params.institutionid as string;
  const { institutionData, status } = useInstitutions(institutionid);

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
      <DataGrid gap={16} columns={[]} data={[]} />
    </Page>
  );
}

export default Institution;
