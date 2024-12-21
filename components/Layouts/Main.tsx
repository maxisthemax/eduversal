import { useRouter, usePathname } from "next/navigation";

//*components
import { FlexBox } from "../Box";

//*mui
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*utils
import axios from "@/utils/axios";

function Main({ children }: { children: React.ReactNode }) {
  //*define
  const { push } = useRouter();
  const pathName = usePathname();

  return (
    <Box>
      <AppBar color="inherit" elevation={0} position="static">
        <Toolbar>
          <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
            <Typography variant="h4" color="primary">
              <b>Photoversal Studio</b>
            </Typography>
            <FlexBox />
            <Button
              color={pathName === "/photos" ? "primary" : "inherit"}
              onClick={async () => {
                push("/photos");
              }}
            >
              PHOTOS
            </Button>
            <Button
              color={pathName === "/cart" ? "primary" : "inherit"}
              onClick={async () => {
                push("/cart");
              }}
            >
              CART
            </Button>
            <Button
              color={pathName === "/account" ? "primary" : "inherit"}
              onClick={async () => {
                push("/account");
              }}
            >
              ACCOUNT
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                await axios.post("/api/auth/signOut");
                push("/signin");
              }}
            >
              SIGN OUT
            </Button>
          </Stack>
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

export default Main;
