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
          backgroundColor: "#F8F3EF",
          alignContent: "center",
          maxWidth: "900px",
        }}
      >
        <Box
          component="img"
          src={`https://${process.env.NEXT_PUBLIC_DO_SPACES_URL}/banner/banner_img`}
          sx={{
            objectFit: "cover",
            height: "100%",
          }}
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
