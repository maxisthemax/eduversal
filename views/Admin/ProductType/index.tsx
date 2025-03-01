import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

//*components
import DataGrid from "@/components/Table/DataGrid";
import { CustomIcon } from "@/components/Icons";
import { Page } from "@/components/Box";
import AddEditProductTypeDialog from "./AddEditProductTypeDialog";

//*mui
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useProductType, ProductTypeData } from "@/data/admin/productType";

function ProductType() {
  const { productsData, status } = useProductType();

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
                  <AddEditProductTypeDialog
                    mode="edit"
                    productTypeId={id as string}
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
        <AddEditProductTypeDialog key="addEditProductTypeDialog" />,
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
