//*components
import DataGrid from "@/components/Table/DataGrid";

//*mui
import Box from "@mui/material/Box";
import { GridColDef } from "@mui/x-data-grid";

function ParentUser() {
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
      headerName: "Eamil",
      flex: 1,
    },
    {
      field: "contact_number_format",
      headerName: "Contact",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DataGrid data={[]} columns={columns} gap={12.1} />
    </Box>
  );
}

export default ParentUser;
