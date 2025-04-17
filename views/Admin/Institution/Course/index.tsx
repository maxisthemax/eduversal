import { useParams } from "next/navigation";
import Link from "next/link";
import PopupState, {
  bindDialog,
  bindMenu,
  bindTrigger,
} from "material-ui-popup-state";

//*components
import { OverlayBox, Page } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";
import AddEditCourseDialog from "./AddEditCourseDialog";
import { CustomIcon } from "@/components/Icons";
import { useCustomDialog } from "@/components/Dialog";
import NoAccess from "@/components/Box/NoAccess";

//*mui
import { GridColDef } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { CourseData, useCourses } from "@/data/admin/institution/course";
import { useAlbums } from "@/data/admin/institution/album";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function Course() {
  const access = useGetStaffAccess("restrict_content_class_club");
  const { handleOpenDialog } = useCustomDialog();
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearData, status: academicYearStatus } =
    useAcademicYears(academicYearId);
  const { coursesData, status: coursesStatus, updateCourse } = useCourses();

  //*const
  const columns: GridColDef<CourseData>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
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
      field: "access_code_status",
      headerName: "Access Code Status",
      width: 200,
      renderCell: ({ formattedValue }) => {
        return (
          <Typography
            sx={{ color: formattedValue === "Disabled" ? "red" : "green" }}
          >
            {formattedValue}
          </Typography>
        );
      },
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
    (access.edit || access.delete) && {
      field: "button",
      headerName: "",
      width: 60,
      renderCell: ({ id, row }) => {
        return (
          <PopupState variant="popover" popupId="menu">
            {(popupState) => (
              <>
                <IconButton size="small" {...bindTrigger(popupState)}>
                  <CustomIcon fontSizeSx="20px" icon="more_vert" />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  {access.edit && (
                    <AddEditCourseDialog mode="edit" courseId={id as string} />
                  )}
                  {access.edit && (
                    <MenuItem
                      onClick={() => {
                        handleOpenDialog(
                          row.force_disable
                            ? {
                                title: "Enable this access code",
                                description: "Are you sure you want to enable?",
                                onConfirm: async () => {
                                  await updateCourse(id as string, {
                                    force_disable: false,
                                  });
                                },
                              }
                            : {
                                title: "Disable this access code",
                                description:
                                  "Are you sure you want to disable?",
                                onConfirm: async () => {
                                  await updateCourse(id as string, {
                                    force_disable: true,
                                  });
                                },
                              }
                        );
                      }}
                    >
                      {row.force_disable ? "Enable" : "Disable"}
                    </MenuItem>
                  )}
                  {access.delete && <DeleteDialog courseId={id as string} />}
                </Menu>
              </>
            )}
          </PopupState>
        );
      },
    },
  ];

  if (!access.view) return <NoAccess />;

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
          title: `${academicYearData?.name ?? ""} (${
            academicYearData?.year?.toString() ?? ""
          })`,
        },
      ]}
      title={`${academicYearData?.name ?? ""} (${
        academicYearData?.year?.toString() ?? ""
      })`}
      leftButton={[]}
      rightButton={[
        access.add && <AddEditCourseDialog key="addEditAcademicYearDialog" />,
      ]}
    >
      <DataGrid
        gap={20}
        columns={columns}
        data={coursesData}
        firstToolbarText={
          <Typography
            variant="inherit"
            sx={{ px: 1, fontWeight: 500 }}
            color="primary"
          >
            Total Classes: <b>{coursesData?.length ?? 0}</b>
          </Typography>
        }
      />
    </Page>
  );
}

export default Course;

function DeleteDialog({ courseId }: { courseId: string }) {
  return (
    <PopupState variant="popover" popupId="delete">
      {(popupState) => (
        <>
          <MenuItem {...bindTrigger(popupState)}>Delete</MenuItem>
          <Dialog
            {...bindDialog(popupState)}
            maxWidth="xs"
            fullWidth
            keepMounted={false}
            disableEnforceFocus={true}
            onClose={() => {
              popupState.close();
            }}
          >
            <DeleteDialogForm
              courseId={courseId}
              handleClose={popupState.close}
            />
          </Dialog>
        </>
      )}
    </PopupState>
  );
}

function DeleteDialogForm({
  courseId,
  handleClose,
}: {
  courseId: string;
  handleClose: () => void;
}) {
  const { albumsData, status } = useAlbums(undefined, { courseId });
  const { deleteCourse, isDeleting } = useCourses(courseId);

  return (
    <OverlayBox isLoading={isDeleting || status === "pending"}>
      <DialogContent>
        {albumsData.length > 0 ? (
          <DialogContentText>
            You have albums associated with this course. Please delete the
            albums first to delete the course.
          </DialogContentText>
        ) : (
          <DialogContentText>
            Are you sure to delete this course?
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 4 }}>
        <Button onClick={handleClose}>Close</Button>
        {albumsData.length === 0 && (
          <Button
            onClick={async () => {
              await deleteCourse(courseId);
            }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </OverlayBox>
  );
}
