import { useParams, useRouter } from "next/navigation";
import PopupState, {
  bindTrigger,
  bindDialog,
  bindMenu,
} from "material-ui-popup-state";

//*components
import { OverlayBox, AdminPage } from "@/components/Box";
import DataGrid from "@/components/Table/DataGrid";
import AddEditAcademicYearDialog from "./AddEditAcademicYearDialog";
import { CustomIcon } from "@/components/Icons";
import NoAccess from "@/components/Box/NoAccess";

//*mui
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function AcademicYear() {
  const access = useGetStaffAccess("restrict_content_year");
  const { push } = useRouter();
  const params = useParams();
  const institutionId = params.institutionId as string;
  const { institutionData, status: institutionStatus } =
    useInstitutions(institutionId);
  const { academicYearsData, status: academicYearStatus } = useAcademicYears();

  //*const
  const columns: GridColDef<(typeof academicYearsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
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
    (access.edit || access.delete) && {
      field: "button",
      headerName: "",
      width: 60,
      renderCell: ({ id }) => {
        return (
          <PopupState variant="popover" popupId="menu">
            {(popupState) => (
              <>
                <IconButton
                  size="small"
                  {...bindTrigger(popupState)}
                  onClick={(e) => {
                    e.stopPropagation();
                    popupState.open(e);
                  }}
                >
                  <CustomIcon fontSizeSx="20px" icon="more_vert" />
                </IconButton>
                <Menu
                  {...bindMenu(popupState)}
                  onKeyDownCapture={(e) => e.stopPropagation()}
                >
                  {access.edit && (
                    <AddEditAcademicYearDialog
                      mode="edit"
                      academicYearId={id as string}
                    />
                  )}
                  {access.delete && (
                    <DeleteDialog academicYearId={id as string} />
                  )}
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
    <AdminPage
      isLoading={
        institutionStatus === "pending" || academicYearStatus === "pending"
      }
      links={[
        { href: "/admin/institution", title: "Institutions" },
        {
          href: `/admin/institution/${institutionId}`,
          title: institutionData?.name,
        },
      ]}
      leftButton={[]}
      title={institutionData?.name}
    >
      <DataGrid
        onRowClick={(params) => {
          push(`/admin/institution/${institutionId}/${params.id}`);
        }}
        gap={19}
        columns={columns}
        data={academicYearsData}
        firstToolbarText={
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 500 }}
            color="inherit"
          >
            Total Academic Years: <b>{academicYearsData?.length ?? 0}</b>
          </Typography>
        }
        lastButton={
          access.add && (
            <AddEditAcademicYearDialog key="addEditAcademicYearDialog" />
          )
        }
      />
    </AdminPage>
  );
}

export default AcademicYear;

function DeleteDialog({ academicYearId }: { academicYearId: string }) {
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
              academicYearId={academicYearId}
              handleClose={popupState.close}
            />
          </Dialog>
        </>
      )}
    </PopupState>
  );
}

function DeleteDialogForm({
  academicYearId,
  handleClose,
}: {
  academicYearId: string;
  handleClose: () => void;
}) {
  const { coursesData, status } = useCourses(undefined, { academicYearId });
  const { deleteAcademicYear, isDeleting } = useAcademicYears(academicYearId);

  return (
    <OverlayBox isLoading={isDeleting || status === "pending"}>
      <DialogContent>
        {coursesData.length > 0 ? (
          <DialogContentText>
            You have courses associated with this academic year. Please delete
            the courses first to delete the academic year.
          </DialogContentText>
        ) : (
          <DialogContentText>
            Are you sure you want to delete this academic year?
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 4 }}>
        <Button onClick={handleClose}>Close</Button>
        {coursesData.length === 0 && (
          <Button
            onClick={async () => {
              await deleteAcademicYear(academicYearId);
              handleClose();
            }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </OverlayBox>
  );
}
