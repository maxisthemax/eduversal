import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { useCustomDialog } from "@/components/Dialog";
import NoAccess from "@/components/Box/NoAccess";

//*lodash
import debounce from "lodash/debounce";

//*mui
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useParent } from "@/data/admin/user/parent";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function ParentUser() {
  const access = useGetStaffAccess("account_parent");
  const { handleOpenDialog } = useCustomDialog();
  const {
    parentData,
    pagination,
    status,
    filter,
    disabledUser,
    approveUser,
    deleteNonVerifiedUser,
  } = useParent();

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "first_name",
      headerName: "First Name",
      minWidth: 200,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      minWidth: 200,
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 250,
    },
    {
      field: "contact_number_format",
      headerName: "Contact",
      minWidth: 180,
    },
    {
      field: "is_disabled",
      headerName: "Status",
      renderCell: ({ value }) => {
        return value ? (
          <Typography color="error">Disabled</Typography>
        ) : (
          <Typography color="success">Enabled</Typography>
        );
      },
      minWidth: 100,
    },
    {
      field: "is_verified",
      headerName: "Verifiy",
      renderCell: ({ value }) => {
        return !value ? (
          <Typography color="error">Not Verified</Typography>
        ) : (
          <Typography color="success">Verified</Typography>
        );
      },
      minWidth: 100,
    },
    {
      field: "address_1",
      headerName: "Address 1",
      minWidth: 200,
    },
    {
      field: "address_2",
      headerName: "Address 2",
      minWidth: 200,
    },
    {
      field: "city",
      headerName: "City",
      minWidth: 100,
    },
    {
      field: "postcode",
      headerName: "PostCode",
      minWidth: 100,
    },
    {
      field: "state",
      headerName: "State",
      minWidth: 100,
    },
    access.edit && {
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
                <Menu
                  {...bindMenu(popupState)}
                  onKeyDownCapture={(e) => e.stopPropagation()}
                >
                  {!row.is_verified && (
                    <MenuItem
                      onClick={async () => {
                        handleOpenDialog({
                          allowOutsideClose: false,
                          title: "Delete User",
                          description: "Are you sure you want to delete user?",
                          onConfirm: async () => {
                            await deleteNonVerifiedUser(id as string);
                          },
                        });
                      }}
                    >
                      Delete
                    </MenuItem>
                  )}
                  {!row.is_verified && (
                    <MenuItem
                      onClick={async () => {
                        handleOpenDialog({
                          allowOutsideClose: false,
                          title: "Manual Verify User",
                          description:
                            "Are you sure you want to manually verify user?",
                          onConfirm: async () => {
                            await approveUser(id as string);
                          },
                        });
                      }}
                    >
                      Manual Verify
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={async () => {
                      handleOpenDialog({
                        allowOutsideClose: false,
                        title: row.is_disabled ? "Enable User" : "Disable User",
                        description: row.is_disabled
                          ? "Are you sure you want to enable user?"
                          : "Are you sure you want to disable user?",
                        onConfirm: async () => {
                          await disabledUser(id as string, !row.is_disabled);
                        },
                      });
                    }}
                  >
                    {row.is_disabled ? "Enable User" : "Disable User"}
                  </MenuItem>
                </Menu>
              </>
            )}
          </PopupState>
        );
      },
    },
  ];

  const handleFilterChange = debounce((model) => {
    filter.setFilterModel(model);
  }, 1000);

  if (!access.view) return <NoAccess />;

  return (
    <Box sx={{ p: 2 }}>
      <DataGrid
        loading={status === "pending"}
        height="maxHeight"
        data={parentData}
        columns={columns}
        gap={12.1}
        pagination={{
          paginationModel: pagination.pageModel,
          onPaginationModelChange: pagination.setPageModel,
          rowCount: pagination.totalCount,
          paginationMode: "server",
        }}
        filter={{
          filterMode: "server",
          onFilterChange: handleFilterChange,
        }}
      />
    </Box>
  );
}

export default ParentUser;
