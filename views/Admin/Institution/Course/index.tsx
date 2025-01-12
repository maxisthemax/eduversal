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

//*mui
import { GridColDef } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { useAlbums } from "@/data/admin/institution/album";

function Course() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearData, status: academicYearStatus } =
    useAcademicYears(academicYearId);
  const { coursesData, status: coursesStatus } = useCourses();

  //*const
  const columns: GridColDef<(typeof coursesData)[]>[] = [
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
      width: 60,
      renderCell: ({ id }) => {
        return (
          <PopupState variant="popover" popupId="menu">
            {(popupState) => (
              <>
                <IconButton size="small" {...bindTrigger(popupState)}>
                  <CustomIcon fontSizeSx="20px" icon="more_vert" />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  <AddEditCourseDialog mode="edit" courseId={id as string} />
                  <DeleteDialog courseId={id as string} />
                </Menu>
              </>
            )}
          </PopupState>
        );
      },
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
      <DialogActions>
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
