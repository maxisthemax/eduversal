import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

//*components
import { FlexBox } from "../Box";
import Footer from "./Footer";

//*mui
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";
import { useCart } from "@/views/Cart";

//*utils
import axios from "@/utils/axios";

function Main({ children }: { children: React.ReactNode }) {
  //*define
  const queryClient = useQueryClient();
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
        queryClient.clear();
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
        <AppBar
          color="inherit"
          elevation={0}
          position="static"
          variant="outlined"
        >
          <Container maxWidth="lg">
            <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
              <Box
                component="img"
                src={"/image/logo.png"}
                height={"30px"}
                sx={{ alignSelf: "center", pl: 2 }}
              />
              <FlexBox />
              <TabContext value={pathName}>
                <TabList>
                  {data?.role !== "USER" && (
                    <Tab
                      onClick={() => push("/admin")}
                      disableRipple
                      label="Admin"
                      value="/admin"
                      sx={{ fontSize: "16px", height: "60px" }}
                    />
                  )}
                  <Tab
                    onClick={() => push("/photos")}
                    disableRipple
                    label="Photos"
                    value="/photos"
                    sx={{ fontSize: "16px" }}
                  />
                  <Tab
                    onClick={() => push("/account/profile")}
                    disableRipple
                    label="Account"
                    value="/account"
                    sx={{ fontSize: "16px" }}
                  />
                  <Tab
                    onClick={() => push("/cart")}
                    disableRipple
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <Typography variant="inherit" sx={{ fontSize: "16px" }}>
                          Cart {`${cart?.length > 0 ? `(${cart.length})` : ""}`}
                        </Typography>
                      </Stack>
                    }
                    value="/cart"
                  />
                </TabList>
              </TabContext>
            </Stack>
          </Container>
        </AppBar>
        <Stack
          sx={{
            background: "#F8F8F8",
            height: getFullHeightSize(-19.2),
            width: "100%",
            overflowY: "scroll", // Always show scrollbar
            msOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
            "&::-webkit-scrollbar": {
              // Chrome, Safari and Opera
              display: "none",
            },
          }}
        >
          <Stack direction="row">{children}</Stack>
          <FlexBox />
          <Footer />
        </Stack>
      </Box>
    );
}

export default Main;
