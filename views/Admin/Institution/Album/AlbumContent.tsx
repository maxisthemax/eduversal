//*mui
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";
import { PhotoData } from "@/data/admin/institution/album";

function AlbumContent({ photos }: { photos: PhotoData[] }) {
  return (
    <Grid container spacing={1}>
      <Grid
        size={{ xs: 8 }}
        sx={{ overflow: "auto", height: getFullHeightSize(23) }}
      >
        <Grid container spacing={2}>
          {photos.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
              key={index}
              sx={{ textAlign: "center" }}
            >
              <Box
                component="img"
                src={`${item.display_url}`}
                alt={item.name}
                style={{
                  aspectRatio: "2/3",
                  display: "block",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <Typography variant="caption">{item.name}</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid size={{ xs: 4 }} sx={{ background: "#EBEBEB" }}></Grid>
    </Grid>
  );
}

export default AlbumContent;
