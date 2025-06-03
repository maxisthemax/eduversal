import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

//*components
import CustomIcon, { GoogleIcon } from "../Icons/CustomIcon";
import { FlexBox } from "../Box";
import Footer from "./Footer";
import { useCustomDialog } from "@/components/Dialog/CustomDialog";

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
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";
import { useGetIsMobileSize } from "@/helpers/view";

//*data
import { useUser } from "@/data/user";
import { useCart } from "@/views/Cart";

//*utils
import axios from "@/utils/axios";

function Main({ children }: { children: React.ReactNode }) {
  //*define
  const { handleOpenDialog } = useCustomDialog();
  const [open, setOpen] = useState(false);
  const isMobile = useGetIsMobileSize();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const pathName = "/" + usePathname()?.split("/")[1];
  const accountPathName =
    "/" + usePathname()?.split("/")[1] + "/" + usePathname()?.split("/")[2];

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
                draggable={false}
                component="img"
                src={"/image/logo.png"}
                sx={{
                  alignSelf: "center",
                  pl: { xs: 0, sm: 0, md: 2 },
                  height: { xs: "24px", sm: "24px", md: "30px" },
                }}
              />
              <FlexBox />
              {isMobile ? (
                <>
                  <Box sx={{ height: "58px", alignContent: "center" }}>
                    <IconButton onClick={() => setOpen(!open)}>
                      <CustomIcon icon="menu" />
                    </IconButton>
                    <IconButton onClick={() => push("/cart")}>
                      <Badge
                        badgeContent={cart?.length ?? 0}
                        color="primary"
                        invisible={cart?.length === 0}
                      >
                        <CustomIcon icon="shopping_bag" />
                      </Badge>
                    </IconButton>
                  </Box>
                  <Drawer
                    open={open}
                    anchor="right"
                    onClose={() => setOpen(false)}
                    PaperProps={{
                      sx: {
                        width: "70%",
                      },
                    }}
                  >
                    <List dense disablePadding>
                      <ListItem>
                        <FlexBox />
                        <IconButton onClick={() => setOpen(false)}>
                          <CustomIcon icon="close" />
                        </IconButton>
                      </ListItem>
                      <ListItemButton
                        onClick={() => {
                          push("/photos");
                          setOpen(false);
                        }}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText
                          primary="Photos"
                          slotProps={{
                            primary: {
                              variant: "h6",
                              color:
                                pathName === "/photos"
                                  ? "primary"
                                  : "#00000099",
                            },
                          }}
                        />
                      </ListItemButton>
                      <Divider sx={{ mx: 2, my: 1 }} />
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                          primary="Account"
                          slotProps={{
                            primary: {
                              variant: "h6",
                              color: "#00000099",
                            },
                          }}
                        />
                      </ListItem>
                      {[
                        {
                          pathName: "/account/profile",
                          label: "Profile",
                          icon: "person",
                        },
                        {
                          pathName: "/account/change-password",
                          label: "Change Password",
                          icon: "lock",
                        },
                        {
                          pathName: "/account/purchase",
                          label: "Purchases",
                          icon: "shopping_cart",
                        },
                        {
                          pathName: "/account/downloadable",
                          label: "Downloadable",
                          icon: "download",
                        },
                      ].map(({ pathName, label, icon }) => {
                        return (
                          <ListItemButton
                            key={pathName}
                            onClick={() => {
                              push(pathName);
                              setOpen(false);
                            }}
                            sx={{ pl: 6 }}
                          >
                            <CustomIcon
                              icon={icon as GoogleIcon}
                              iconColor={
                                accountPathName === pathName
                                  ? "primary"
                                  : "#00000099"
                              }
                            />
                            <ListItemText
                              primary={label}
                              slotProps={{
                                primary: {
                                  pl: 1,
                                  variant: "h6",
                                  color:
                                    accountPathName === pathName
                                      ? "primary"
                                      : "#00000099",
                                },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                      <Divider sx={{ mx: 2, my: 1 }} />
                    </List>
                    <Box sx={{ flex: 1 }} />
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          handleOpenDialog({
                            title: "Logout",
                            description: "Are you sure you want to logout?",
                            onConfirm: async () => {
                              await axios.post("auth/signOut");
                              push("/signin");
                            },
                          });
                        }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Drawer>
                </>
              ) : (
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
                          <Typography
                            variant="inherit"
                            sx={{ fontSize: "16px" }}
                          >
                            Cart{" "}
                            {`${cart?.length > 0 ? `(${cart.length})` : ""}`}
                          </Typography>
                        </Stack>
                      }
                      value="/cart"
                    />
                  </TabList>
                </TabContext>
              )}
            </Stack>
          </Container>
        </AppBar>
        <Stack
          sx={{
            background: "#F8F8F8",
            minHeight: getFullHeightSize(-19.2),
            width: "100%",
            overflowY: "hidden", // Always show scrollbar
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
