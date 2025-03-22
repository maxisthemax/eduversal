//*components
import { Page } from "@/components/Box";

//*mui
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

//*utils
import { useUser } from "@/data/user";
import Button from "@mui/material/Button";

function Downloadable() {
  const { data } = useUser();

  return (
    <Page title="Purchase" subtitle="Manage your purchase">
      <Grid container spacing={2}>
        {data.download_images.map((item, index) => (
          <Grid
            size={{
              xs: 3,
            }}
            key={index}
            sx={{
              textAlign: "center",
            }}
          >
            <Stack spacing={1}>
              <Box
                component="img"
                src={`${item.photoUrl}`}
                alt={item.photoUrl}
                sx={{
                  display: "block",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <Box>
                <Button variant="contained" onClick={async () => {}}>
                  Download
                </Button>
              </Box>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
export default Downloadable;
