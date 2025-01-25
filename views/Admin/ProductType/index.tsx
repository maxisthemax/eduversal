//*components
import DataGrid from "@/components/Table/DataGrid";
import { Page } from "@/components/Box";

//*mui
import { GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";

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
  ];

  return (
    <Page
      rightButton={[
        <Button key="add-product-type" variant="contained" onClick={() => {}}>
          Add Product Type
        </Button>,
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
