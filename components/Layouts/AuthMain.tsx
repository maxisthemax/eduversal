//*mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";

//*helpers
import { useGetIsMobileSize } from "@/helpers/view";

function AuthMain({ children }: { children: React.ReactNode }) {
  const isMobile = useGetIsMobileSize();
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
          draggable={false}
          component="img"
          src={`https://${process.env.NEXT_PUBLIC_DO_SPACES_URL}/banner/banner_img`}
          sx={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
          }}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 7.5 }}
        sx={
          isMobile
            ? {
                backgroundImage: `url(https://${process.env.NEXT_PUBLIC_DO_SPACES_URL}/banner/banner_img)`,
                backgroundPositionX: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#F8F8F8",
              }
            : {}
        }
      >
        <Stack
          direction="row"
          sx={{
            height: "100vh",
            width: "100%",
            placeItems: "end",
          }}
        >
          {children}
        </Stack>
      </Grid>
    </Grid>
  );
}

export default AuthMain;
