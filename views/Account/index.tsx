import { useParams, useRouter } from "next/navigation";

//*components
import Purchase from "./Purchase";
import Downloadable from "./Downloadable";
import Profile from "./Profile";
import ChangePassword from "./ChangePassword";
import { CustomIcon } from "@/components/Icons";
import { GoogleIcon } from "@/components/Icons/CustomIcon";

//*mui
import Grid from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

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
  { type: "divider" },
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
  const { push } = useRouter();
  const { page } = useParams();

  const pageComponent = {
    profile: <Profile />,
    purchase: <Purchase />,
    downloadable: <Downloadable />,
    "change-password": <ChangePassword />,
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Grid container>
        <Grid
          size={{ xs: 2 }}
          sx={{
            borderRight: "0.5px solid #B8BDC4",
            pl: 2,
            pr: 2,
            height: getFullHeightSize(8),
            overflow: "auto",
          }}
        >
          <List>
            {menuItems.map((item, index) => {
              if (item.type === "header") {
                return (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { sx: { fontWeight: 300 } } }}
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
                      <CustomIcon icon={item.icon} />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                );
              } else {
                return <ListItem key={index} divider />;
              }
            })}
          </List>
        </Grid>
        <Grid size={{ xs: 10 }}>{pageComponent[page as string]}</Grid>
      </Grid>
    </Container>
  );
}
export default Account;
