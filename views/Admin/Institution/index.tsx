import Link from "next/link";
import PopupState, {
  bindTrigger,
  bindDialog,
  bindMenu,
} from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { OverlayBox, Page } from "@/components/Box";
import AddEditInstitutionDialog from "./AddEditInstitutionDialog";
import { CustomIcon } from "@/components/Icons";

//*mui
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";

function Institution() {
  //*data
  const { institutionsData, status } = useInstitutions();

  //*const
  const columns: GridColDef<(typeof institutionsData)[]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue, id }) => {
        return <Link href={`/admin/institution/${id}`}>{formattedValue}</Link>;
      },
    },
    {
      field: "code",
      headerName: "Code",
      width: 150,
    },
    {
      field: "type_name_format",
      headerName: "Type",
      width: 200,
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
        return (
          <PopupState variant="popover" popupId="menu">
            {(popupState) => (
              <>
                <IconButton size="small" {...bindTrigger(popupState)}>
                  <CustomIcon fontSizeSx="20px" icon="more_vert" />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  <AddEditInstitutionDialog
                    mode="edit"
                    institutionId={id as string}
                  />
                  <DeleteDialog institutionId={id as string} />
                </Menu>
              </>
            )}
          </PopupState>
        );
      },
      width: 60,
    },
  ];

  return (
    <Page
      leftButton={[]}
      links={[{ href: "/admin/institution", title: "Institutions" }]}
      rightButton={[
        <AddEditInstitutionDialog key="AddEditInstitutionDialog" />,
      ]}
      isLoading={status === "pending"}
    >
      <DataGrid
        gap={16}
        data={institutionsData}
        columns={columns}
        loading={status === "pending"}
      />
    </Page>
  );
}

export default Institution;

function DeleteDialog({ institutionId }: { institutionId: string }) {
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
              institutionId={institutionId}
              handleClose={popupState.close}
            />
          </Dialog>
        </>
      )}
    </PopupState>
  );
}

function DeleteDialogForm({
  institutionId,
  handleClose,
}: {
  institutionId: string;
  handleClose: () => void;
}) {
  const { academicYearsData, status } = useAcademicYears(undefined, {
    institutionId,
  });
  const { deleteInstitution, isDeleting } = useInstitutions(institutionId);

  return (
    <OverlayBox isLoading={isDeleting || status === "pending"}>
      <DialogContent>
        {academicYearsData.length > 0 ? (
          <DialogContentText>
            You have academic years associated with this institution. Please
            delete the academic years first to delete the institution.
          </DialogContentText>
        ) : (
          <DialogContentText>
            Are you sure to delete this institution?
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {academicYearsData.length === 0 && (
          <Button
            onClick={async () => {
              await deleteInstitution(institutionId);
            }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </OverlayBox>
  );
}
