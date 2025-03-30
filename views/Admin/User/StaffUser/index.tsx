import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { useState } from "react";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { useCustomDialog } from "@/components/Dialog";
import { Page } from "@/components/Box";
import PermissionDialog from "./PermissionDialog";

//*mui
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useStaff } from "@/data/admin/user/staff";

function StaffUser() {
  const [staffId, setStaffId] = useState<string>("");
  const { handleOpenDialog } = useCustomDialog();
  const { staffData, updateUserRole, status } = useStaff();

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "contact_number_format",
      headerName: "Contact",
      flex: 1,
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
                  <MenuItem
                    onClick={async () => {
                      handleOpenDialog({
                        allowOutsideClose: false,
                        title: "Remove Admin",
                        description: "Are you sure you want to remove admin?",
                        onConfirm: async () => {
                          await updateUserRole("USER", id as string);
                        },
                      });
                    }}
                  >
                    Remove Admin
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setStaffId(id as string);
                    }}
                  >
                    Update Permission
                  </MenuItem>
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
      rightButton={[
        <Button
          key="add-admin"
          variant="contained"
          onClick={() => {
            handleOpenDialog({
              allowOutsideClose: false,
              title: "Add Admin",
              description:
                "Add admin with user email.\nMake sure email already registered.",
              textField: { id: "text", defaultValue: "" },
              placeholder: "User email",
              onConfirm: async (value) => {
                await updateUserRole("ADMIN", undefined, value as string);
              },
            });
          }}
        >
          Add Admin
        </Button>,
      ]}
    >
      <DataGrid
        loading={status === "pending"}
        gap={16}
        data={staffData}
        columns={columns}
      />
      <PermissionDialog staffId={staffId} handleClose={() => setStaffId("")} />
    </Page>
  );
}

export default StaffUser;
