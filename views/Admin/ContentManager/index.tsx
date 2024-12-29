import Link from "next/link";

//*components
import DataGrid from "@/components/Table/DataGrid";

//*mui
import Box from "@mui/material/Box";
import { GridColDef } from "@mui/x-data-grid";

//*data
import { useInstitutions } from "@/data/institutions";

function ContentManager() {
  //*data
  const { data } = useInstitutions();

  //*const
  const columns: GridColDef<(typeof data)[number]>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ formattedValue }) => {
        return <Link href={""}>{formattedValue}</Link>;
      },
    },
    {
      field: "code",
      headerName: "Code",
      flex: 1,
    },
    {
      field: "type_name_format",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "created_at",
      headerName: "Created At",
      type: "date",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DataGrid data={data} columns={columns} />
    </Box>
  );
}

export default ContentManager;
