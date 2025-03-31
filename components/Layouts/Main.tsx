import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";

//*components
import { FlexBox } from "../Box";
import { CustomIcon } from "@/components/Icons";

//*mui
import Toolbar from "@mui/material/Toolbar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";
import { useCart } from "@/views/Cart";

//*utils
import axios from "@/utils/axios";

function Main({ children }: { children: React.ReactNode }) {
  //*define
  const { push } = useRouter();
  const pathName = "/" + usePathname()?.split("/")[1];

  //*data
  const { cart } = useCart();
  const { data, status } = useUser();

  useEffect(() => {
    async function accountDisableCheck() {
      if (data.is_disabled) {
        await axios.post("auth/signOut");
        toast.error("Your account has been disabled. Please contact support.");
        push("/signin");
      }
    }

    if (data && status === "success") {
      accountDisableCheck();
    }
  }, [data, status]);

  if (status === "pending") return <LinearProgress />;
  else
    return (
      <Box>
        <AppBar color="inherit" elevation={1} position="static">
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
                color={pathName === "/account" ? "primary" : "inherit"}
                onClick={async () => {
                  push("/account/profile");
                }}
              >
                ACCOUNT
              </Button>
              <IconButton onClick={() => push("/cart")} size="small">
                <Badge
                  badgeContent={cart?.length}
                  color="primary"
                  invisible={!cart}
                >
                  <CustomIcon
                    fontSize="small"
                    icon="shopping_bag"
                    iconColor={pathName === "/cart" ? "primary" : "inherit"}
                  />
                </Badge>
              </IconButton>
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
