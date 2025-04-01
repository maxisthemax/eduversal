import { useParams } from "next/navigation";

//*components
import { Page, useCustomTabs } from "@/components/Box";
import AlbumContent from "./AlbumContent";
import AddEditAlbumDialog from "./AddEditAlbumDialog";
import { useCustomDialog } from "@/components/Dialog";
import AddEditPackagesDialog from "./AddEditPackagesDialog";
import NoAccess from "@/components/Box/NoAccess";

//*data
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAlbums } from "@/data/admin/institution/album";
import { useGetStaffAccess } from "@/data/admin/user/staff";

//*mui
import Button from "@mui/material/Button";

function Album() {
  const access = useGetStaffAccess("restrict_content_album");
  const packageAccess = useGetStaffAccess("album_package");
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

  if (!access.view) return <NoAccess />;

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
        (packageAccess.view ||
          packageAccess.edit ||
          packageAccess.add ||
          packageAccess.delete) && (
          <AddEditPackagesDialog key="addEditPackagesDialog" />
        ),
        access.add && <AddEditAlbumDialog key={"addEditAlbumDialog"} />,
        albumsData.length > 0 && access.delete && (
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
