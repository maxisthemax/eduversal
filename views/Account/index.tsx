import { useParams, useRouter } from "next/navigation";

//*components
import Purchase from "./Purchase";
import Downloadable from "./Downloadable";
import Profile from "./Profile";
import ChangePassword from "./ChangePassword";
import { CustomIcon } from "@/components/Icons";
import { GoogleIcon } from "@/components/Icons/CustomIcon";
import { useCustomDialog } from "@/components/Dialog/CustomDialog";

//*mui
import Grid from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useUser } from "@/data/user";

//*utils
import axios from "@/utils/axios";

// Define types for menu items
type MenuItem =
  | { type: "header"; text: string }
  | { type: "button"; text: string; icon: GoogleIcon; route: string }
  | { type: "divider" };

// Menu items data
const menuItems: MenuItem[] = [
  { type: "header", text: "USER ACCOUNT" },
  { type: "button", text: "Profile", icon: "person", route: "profile" },
  {
    type: "button",
    text: "Change Password",
    icon: "lock",
    route: "change-password",
  },
  { type: "header", text: "MARKETPLACE" },
  { type: "button", text: "Purchase", icon: "work", route: "purchase" },
  {
    type: "button",
    text: "Downloadable",
    icon: "download",
    route: "downloadable",
  },
];

function Account() {
  const { handleOpenDialog } = useCustomDialog();
  const { status } = useUser();
  const { push } = useRouter();
  const { page } = useParams();

  if (status === "pending") return <LinearProgress />;

  const pageComponent = {
    profile: <Profile />,
    purchase: <Purchase />,
    downloadable: <Downloadable />,
    "change-password": <ChangePassword />,
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ backgroundColor: "white" }}>
        <Grid
          container
          sx={{ backgroundColor: "white", height: getFullHeightSize(15.9) }}
        >
          <Grid
            size={{ xs: 3 }}
            sx={{
              borderRight: "0.5px solid #B8BDC4",
              pl: 2,
              pr: 2,
              backgroundColor: "white",
            }}
          >
            <List sx={{ top: "0px", position: "sticky" }}>
              {menuItems.map((item, index) => {
                if (item.type === "header") {
                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={<b>{item.text}</b>}
                        slotProps={{}}
                      />
                    </ListItem>
                  );
                } else if (item.type === "button") {
                  return (
                    <ListItemButton
                      key={index}
                      selected={page === item.route}
                      onClick={() => {
                        push(item.route);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>
                        <CustomIcon
                          icon={item.icon}
                          activeColor="#006DEE"
                          active={page === item.route}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          color:
                            page === item.route ? "#006DEE" : "text.secondary",
                        }}
                      />
                    </ListItemButton>
                  );
                } else {
                  return <ListItem key={index} divider />;
                }
              })}
              <Box sx={{ py: 2 }}>
                <Divider />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
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
            </List>
          </Grid>
          <Grid size={{ xs: 9 }} sx={{ p: 2, backgroundColor: "white" }}>
            {pageComponent[page as string]}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
export default Account;
