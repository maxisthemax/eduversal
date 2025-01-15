//*components
import DataGrid from "@/components/Table/DataGrid";

//*mui
import Box from "@mui/material/Box";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useParent } from "@/data/admin/user/parent";

//*lodash
import debounce from "lodash/debounce";

function ParentUser() {
  const { parentData, pagination, status, filter } = useParent();

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
  ];

  const handleFilterChange = debounce((model) => {
    filter.setFilterModel(model);
  }, 1000);

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
