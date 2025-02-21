import { useParams } from "next/navigation";

//*components
import { Page } from "@/components/Box";
import useCustomTabs from "@/components/Box/useCustomTabs";
import AlbumContent from "./AlbumContent";
import AddEditAlbumDialog from "./AddEditAlbumDialog";
import { useCustomDialog } from "@/components/Dialog";
import AddEditPackagesDialog from "./AddEditPackagesDialog";

//*data
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAlbums } from "@/data/admin/institution/album";

//*mui
import Button from "@mui/material/Button";

function Album() {
  const { handleOpenDialog } = useCustomDialog();
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const courseId = params.courseId as string;

  //*data
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearData, status: academicYearStatus } =
    useAcademicYears(academicYearId);
  const { courseData, status: courseStatus } = useCourses(courseId);
  const { albumsData, status: albumStatus, deleteAlbum } = useAlbums();

  const { tabsComponent, value } = useCustomTabs({
    tabs: albumsData.map(({ id, name }) => {
      return {
        label: name,
        value: id,
        render: <AlbumContent albumId={id} />,
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
        <AddEditPackagesDialog key="addEditPackagesDialog" />,
        <AddEditAlbumDialog key={"addEditAlbumDialog"} />,
        albumsData.length > 0 && (
          <Button
            key="deleteAlbum"
            onClick={() => {
              handleOpenDialog({
                allowOutsideClose: false,
                title: "Delete This Album",
                description:
                  "Are you sure you want to delete this album?\n All photo related to this album will be deleted and cannot be recovered.",
                onConfirm: async () => {
                  await deleteAlbum(value);
                },
              });
            }}
            variant="contained"
          >
            Delete This ALbum
          </Button>
        ),
      ]}
    >
      {tabsComponent}
    </Page>
  );
}

export default Album;
