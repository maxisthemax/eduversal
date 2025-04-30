import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { AdminPage } from "@/components/Box";
import AddEditProductVariationDialog from "./AddEditProductVariationDialog";
import { useCustomDialog } from "@/components/Dialog/CustomDialog";
import NoAccess from "@/components/Box/NoAccess";

//*mui
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import MenuItem from "@mui/material/MenuItem";
import { GridColDef } from "@mui/x-data-grid";

//*data
import {
  useProductVariation,
  ProductVariationData,
} from "@/data/admin/productVariation";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function ProductVariation() {
  const access = useGetStaffAccess("product_variation");
  const { productVariationsData, status, deleteProductVariation } =
    useProductVariation();
  const { handleOpenDialog } = useCustomDialog();

  const columns: GridColDef<ProductVariationData>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "is_downloadable_format",
      headerName: "Is Downloadable",
      width: 150,
    },
    {
      field: "options",
      headerName: "Options",
      flex: 2,
      renderCell: ({ value }) => {
        return (
          <Table size="small">
            <TableHead sx={{ background: "#f2f2f2" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={100}>Price</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {value.map(({ id, name, description, price_format }) => {
                return (
                  <TableRow key={id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{description}</TableCell>
                    <TableCell>{price_format}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      },
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
                    <AddEditProductVariationDialog
                      mode="edit"
                      productVariationId={id as string}
                    />
                  )}
                  {access.delete && (
                    <MenuItem
                      onClick={() => {
                        handleOpenDialog({
                          title: "Delete Product Variation",
                          description: "Are you sure you want to delete this?",
                          onConfirm: async () => {
                            await deleteProductVariation(id as string);
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
    <AdminPage rightButton={[]}>
      <DataGrid
        loading={status === "pending"}
        gap={12}
        data={productVariationsData}
        columns={columns}
        autoRowHeightColumn={["options"]}
        lastButton={
          access.add && (
            <AddEditProductVariationDialog key="addEditProductVariationDialog" />
          )
        }
      />
    </AdminPage>
  );
}

export default ProductVariation;
