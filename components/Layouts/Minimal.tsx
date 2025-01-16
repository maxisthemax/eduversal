//*mui
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function Minimal({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <AppBar color="inherit" elevation={0} position="static">
        <Toolbar>
          <Box component="img" src={"/image/logo.png"} height={"30px"} />
        </Toolbar>
      </AppBar>
      <Stack
        direction="row"
        sx={{
          height: getFullHeightSize(10),
          width: "100%",
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}

export default Minimal;
