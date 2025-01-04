//*mui
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

//*data
import { usePhotos } from "@/data/admin/institution/photo";

function Photo({ albumId }: { albumId: string }) {
  const { photosData } = usePhotos(albumId);

  return photosData.map((item, index) => (
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
  ));
}

export default Photo;
