import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

//*components
import { FlexBox } from "../Box";
import { CustomIcon } from "../Icons";
import { GoogleIcon } from "../Icons/CustomIcon";

//*mui
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";

function AdminMain({ children }: { children: React.ReactNode }) {
  //*define
  const pathname = usePathname();
  const [open, setOpen] = useState({
    restrictContent: pathname === "/admin/institution",
    userlist: pathname === "/admin/parentuser",
  });
  const { push } = useRouter();

  //*data
  const { data, status } = useUser();

  if (status === "pending") return <LinearProgress />;
  else
    return (
      <Box>
        <AppBar color="inherit" elevation={0} position="static">
          <Toolbar>
            <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
              <Typography variant="h4" color="primary">
                <b>Admin Control</b>
              </Typography>
              <FlexBox />
              {data?.role !== "USER" && (
                <Button
                  onClick={async () => {
                    push("/");
                  }}
                >
                  BACK
                </Button>
              )}
            </Stack>
          </Toolbar>
          <Divider />
        </AppBar>
        <Stack
          direction="row"
          sx={{
            height: getFullHeightSize(8.1),
            width: "100%",
          }}
        >
          <List
            dense
            disablePadding
            component="nav"
            sx={{
              width: "100%",
              maxWidth: 220,
              borderRight: "0.5px solid #e0e0e0",
              whiteSpace: "nowrap",
            }}
          >
            {[
              {
                id: "restrictContent",
                title: "Restrict Content",
                icon: "lock",
                list: [{ title: "Institutions", href: "/admin/institution" }],
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
                icon: "globe",
                list: [{ title: "Setting", href: "/admin/setting" }],
              },
            ].map(({ title, list, id, icon }, index) => {
              return (
                <>
                  <ListItemButton
                    onClick={() => {
                      setOpen({
                        ...open,
                        [id]: !open[id],
                      });
                    }}
                    key={index}
                    disableGutters
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                      pl: 2,
                      pr: 2,
                    }}
                  >
                    <CustomIcon
                      icon={icon as GoogleIcon}
                      fontSizeSx="14px"
                      iconColor="black"
                    />
                    <ListItemText
                      primary={<b>{title}</b>}
                      sx={{ pl: 1 }}
                      slotProps={{ primary: { variant: "body1" } }}
                    />
                    <FlexBox />
                    <CustomIcon icon="keyboard_arrow_down" fontSizeSx="14px" />
                  </ListItemButton>
                  <Collapse in={open[id]}>
                    {list.map(({ title, href }, index) => {
                      return (
                        <ListItemButton
                          selected={href === pathname}
                          key={index}
                          onClick={() => push(href)}
                        >
                          <ListItemText
                            primary={title}
                            sx={{ pl: 3 }}
                            slotProps={{
                              primary: {
                                variant: "body1",
                                fontWeight: "inherit",
                                color:
                                  href === pathname ? "primary" : "inherit",
                              },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Collapse>
                </>
              );
            })}
          </List>
          <Box sx={{ overflow: "auto", width: "100%" }}>{children}</Box>
        </Stack>
      </Box>
    );
}

export default AdminMain;
