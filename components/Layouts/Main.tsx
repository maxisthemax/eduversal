import { useRouter, usePathname } from "next/navigation";

//*components
import { FlexBox } from "../Box";

//*mui
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";

function Main({ children }: { children: React.ReactNode }) {
  //*define
  const { push } = useRouter();
  const pathName = "/" + usePathname()?.split("/")[1];

  //*data
  const { data, status } = useUser();

  if (status === "pending") return <LinearProgress />;
  else
    return (
      <Box>
        <AppBar color="inherit" elevation={0} position="static">
          <Toolbar>
            <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
              <Box component="img" src={"/image/logo.png"} height={"30px"} />
              <FlexBox />
              {data?.role !== "USER" && (
                <Button
                  color={pathName === "/admin" ? "primary" : "inherit"}
                  onClick={async () => {
                    push("/admin");
                  }}
                >
                  ADMIN
                </Button>
              )}
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
