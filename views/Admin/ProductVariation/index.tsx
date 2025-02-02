import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { Page } from "@/components/Box";
import AddEditProductVariationDialog from "./AddEditProductVariationDialog";

//*mui
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { GridColDef } from "@mui/x-data-grid";

//*data
import {
  useProductVariation,
  ProductVariationData,
} from "@/data/admin/productVariation";

function ProductVariation() {
  const { productVariationsData, status } = useProductVariation();

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
            <TableHead>
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
                  <AddEditProductVariationDialog
                    mode="edit"
                    productVariationId={id as string}
                  />
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
      rightButton={[
        <AddEditProductVariationDialog key="addEditProductVariationDialog" />,
      ]}
    >
      <DataGrid
        loading={status === "pending"}
        gap={16}
        data={productVariationsData}
        columns={columns}
        autoRowHeightColumn={["options"]}
      />
    </Page>
  );
}

export default ProductVariation;
