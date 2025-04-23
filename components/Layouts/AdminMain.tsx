import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

//*lodash
import includes from "lodash/includes";

//*components
import { FlexBox } from "../Box";
import { CustomIcon } from "../Icons";
import { GoogleIcon } from "../Icons/CustomIcon";

//*mui
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import ListItemIcon from "@mui/material/ListItemIcon";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";

//*utils
import axios from "@/utils/axios";
import { useCustomDialog } from "../Dialog/CustomDialog";

function AdminMain({ children }: { children: React.ReactNode }) {
  const { handleOpenDialog } = useCustomDialog();

  //*define
  const pathname = usePathname();
  const [open, setOpen] = useState({
    restrictContent: includes(
      ["/admin/institution", "/admin/producttype", "/admin/productvariation"],
      pathname
    ),
    userlist: includes(
      ["/admin/user/parentuser", "/admin/user/staffuser"],
      pathname
    ),
    sales_management: includes(["/admin/sales/order"], pathname),
    account: includes(
      ["/admin/account/profile", "/admin/account/change-password"],
      pathname
    ),
  });
  const { push } = useRouter();

  //*data
  const { status } = useUser();

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
          <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
            <Box
              component="img"
              src={"/image/logo.png"}
              height={"30px"}
              sx={{ alignSelf: "center", pl: 2 }}
            />
            <FlexBox />
            <TabContext value={""}>
              <TabList>
                <Tab
                  onClick={() => push("/photos")}
                  disableRipple
                  label="Go To User"
                  value="/admin"
                  sx={{ fontSize: "16px", height: "60px" }}
                />
              </TabList>
            </TabContext>
          </Stack>
        </AppBar>
        <Stack
          direction="row"
          sx={{
            height: getFullHeightSize(7.7),
            width: "100%",
          }}
        >
          <List
            disablePadding
            sx={{
              width: "100%",
              maxWidth: 235,
              borderRight: "0.5px solid #e0e0e0",
              whiteSpace: "nowrap",
            }}
          >
            {[
              {
                id: "dashboard",
                title: "Dashboard",
                icon: "dashboard",
                href: "/admin",
              },
              {
                id: "restrictContent",
                title: "Restrict Content",
                icon: "lock",
                list: [
                  { title: "Institutions", href: "/admin/institution" },
                  { title: "Product Type", href: "/admin/producttype" },
                  {
                    title: "Product Variation",
                    href: "/admin/productvariation",
                  },
                ],
              },
              {
                id: "userlist",
                title: "User List",
                icon: "people",
                list: [
                  { title: "Parent User", href: "/admin/user/parentuser" },
                  { title: "Staff User", href: "/admin/user/staffuser" },
                ],
              },
              {
                id: "general",
                title: "General",
                icon: "settings",
                list: [
                  { title: "Setting", href: "/admin/general/setting" },
                  { title: "Banner", href: "/admin/banner" },
                ],
              },
              {
                id: "sales_management",
                title: "Sales Management",
                icon: "monitoring",
                list: [
                  { title: "Orders", href: "/admin/sales/order" },
                  {
                    title: "School Summary",
                    href: "/admin/sales/schoolsummary",
                  },
                ],
              },
              {
                id: "account",
                title: "Account",
                icon: "account_circle",
                list: [
                  { title: "Profile", href: "/admin/account/profile" },
                  {
                    title: "Change Password",
                    href: "/admin/account/change-password",
                  },
                  {
                    title: "Logout",
                    onClick: () => {
                      handleOpenDialog({
                        title: "Logout",
                        description: "Are you sure you want to logout?",
                        onConfirm: async () => {
                          await axios.post("auth/signOut");
                          push("/admin/signin");
                        },
                      });
                    },
                  },
                ],
              },
            ].map(({ title, list, id, icon, href }, index) => {
              return (
                <Box key={id}>
                  <ListItemButton
                    selected={pathname === href}
                    onClick={() => {
                      if (href) push(href);
                      else
                        setOpen({
                          ...open,
                          [id]: !open[id],
                        });
                    }}
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                      pl: 2,
                      pr: 2,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>
                      <CustomIcon icon={icon as GoogleIcon} />
                    </ListItemIcon>
                    <ListItemText primary={<b>{title}</b>} sx={{ pl: 1 }} />
                    <FlexBox />
                    {list && (
                      <CustomIcon
                        icon="keyboard_arrow_down"
                        fontSizeSx="14px"
                      />
                    )}
                  </ListItemButton>
                  <Collapse in={open[id]}>
                    {list?.map(({ title, href, onClick }, index) => {
                      return (
                        <ListItemButton
                          selected={href === "/admin/" + pathname.split("/")[2]}
                          key={index}
                          onClick={onClick ? onClick : () => push(href)}
                        >
                          <ListItemText
                            primary={title}
                            sx={{ pl: 5 }}
                            slotProps={{
                              primary: {
                                color: "inherit",
                              },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Collapse>
                </Box>
              );
            })}
          </List>
          <Box
            sx={{
              overflow: "auto",
              width: "100%",
              background: "#f8f8f8",
            }}
          >
            {children}
          </Box>
        </Stack>
      </Box>
    );
}

export default AdminMain;
