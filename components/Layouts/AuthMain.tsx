//*mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function AuthMain({ children }: { children: React.ReactNode }) {
  return (
    <Grid container>
      <Grid
        size={{ xs: 0, sm: 0, md: 4.5 }}
        sx={{
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={"/image/login_bg_1.png"}
          height={"100%"}
          width={"100%"}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 7.5 }}>
        <Stack
          direction="row"
          sx={{
            height: getFullHeightSize(10),
            width: "100%",
          }}
        >
          {children}
        </Stack>
      </Grid>
    </Grid>
  );
}

export default AuthMain;
