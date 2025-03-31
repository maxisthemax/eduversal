import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { Page } from "@/components/Box";
import AddEditProductTypeDialog from "./AddEditProductTypeDialog";
import { useCustomDialog } from "@/components/Dialog/CustomDialog";
import NoAccess from "@/components/Box/NoAccess";

//*mui
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useProductType, ProductTypeData } from "@/data/admin/productType";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function ProductType() {
  const access = useGetStaffAccess("product_type");
  const { productsData, status, deleteProductType } = useProductType();
  const { handleOpenDialog } = useCustomDialog();

  const columns: GridColDef<ProductTypeData>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "price_format",
      headerName: "Price",
      flex: 1,
    },
    {
      field: "is_deliverable_format",
      headerName: "Is Deliverable",
      flex: 1,
    },
    (access.edit || access.delete) && {
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
                  {access.edit && (
                    <AddEditProductTypeDialog
                      mode="edit"
                      productTypeId={id as string}
                    />
                  )}
                  {access.delete && (
                    <MenuItem
                      onClick={() => {
                        handleOpenDialog({
                          title: "Delete Product Type",
                          description: "Are you sure you want to delete this?",
                          onConfirm: async () => {
                            await deleteProductType(id as string);
                            popupState.close();
                          },
                        });
                      }}
                    >
                      Delete
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </PopupState>
        );
      },
      width: 60,
    },
  ];

  if (!access.view) return <NoAccess />;

  return (
    <Page
      rightButton={[
        access.add && (
          <AddEditProductTypeDialog key="addEditProductTypeDialog" />
        ),
      ]}
    >
      <DataGrid
        loading={status === "pending"}
        gap={16}
        data={productsData}
        columns={columns}
      />
    </Page>
  );
}

export default ProductType;
