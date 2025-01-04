//*components
import { useParams } from "next/navigation";
import { Page } from "@/components/Box";
import useCustomTabs from "@/components/Box/useCustomTabs";

//*mui
import Button from "@mui/material/Button";

//*data
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import { useInstitutions } from "@/data/admin/institution/institution";
import AlbumContent from "./AlbumContent";
import { useAlbums } from "@/data/admin/institution/album";

function Album() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;
  const { institutionData, status } = useInstitutions(institutionId);
  const { academicYearData } = useAcademicYears(institutionId, academicYearId);
  const { courseData } = useCourses(institutionId, academicYearId, courseId);
  const { albumsData } = useAlbums(institutionId, academicYearId, courseId);
  console.log("🚀 ~ Album ~ albumsData:", albumsData);

  const { tabsComponent } = useCustomTabs({
    tabs: [
      {
        label: "Individual",
        value: "individual",
        render: <AlbumContent />,
      },
    ],
    defaultTab: "individual",
    isPaper: false,
  });
  return (
    <Page
      isLoading={status === "pending"}
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
        {
          href: `/admin/institution/${institutionId}/${academicYearId}/${courseId}`,
          title: courseData?.name,
        },
      ]}
      rightButton={[
        <Button variant="contained" key="">
          Add New Category
        </Button>,
      ]}
    >
      {tabsComponent}
    </Page>
  );
}

export default Album;
