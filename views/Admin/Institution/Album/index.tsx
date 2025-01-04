import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import useCustomTabs from "@/components/Box/useCustomTabs";
import AlbumContent from "./AlbumContent";

//*mui
import Button from "@mui/material/Button";

//*data
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAlbums } from "@/data/admin/institution/album";

function Album() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;

  //*data
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearData, status: academicYearStatus } = useAcademicYears(
    institutionId,
    academicYearId
  );
  const { courseData, status: courseStatus } = useCourses(
    institutionId,
    academicYearId,
    courseId
  );
  const { albumsData, status: albumStatus } = useAlbums(
    institutionId,
    academicYearId,
    courseId
  );

  const { tabsComponent } = useCustomTabs({
    tabs: albumsData.map(({ id, name, photos }) => {
      return {
        label: name,
        value: id,
        render: <AlbumContent photos={photos} />,
      };
    }),
    defaultTab: albumsData[0]?.id,
    isPaper: false,
  });

  return (
    <Page
      isLoading={
        institutionStatus === "pending" ||
        albumStatus === "pending" ||
        academicYearStatus === "pending" ||
        courseStatus === "pending"
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
        {
          href: `/admin/institution/${institutionId}/${academicYearId}/${courseId}`,
          title: courseData?.name,
        },
      ]}
      rightButton={[
        <Button variant="contained" key="">
          Add New Album
        </Button>,
      ]}
    >
      {tabsComponent}
    </Page>
  );
}

export default Album;
