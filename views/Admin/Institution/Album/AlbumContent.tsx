//*mui
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

const itemData = [
  {
    img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
    title: "Fern",
  },
  {
    img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f",
    title: "Snacks",
  },
  {
    img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
    title: "Mushrooms",
  },
  {
    img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383",
    title: "Tower",
  },
  {
    img: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1",
    title: "Sea star",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
  },
  {
    img: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6",
    title: "Basketball",
  },
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    title: "Breakfast",
  },
  {
    img: "https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d",
    title: "Tree",
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    title: "Burger",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    title: "Camera",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    title: "Coffee",
  },
  {
    img: "https://images.unsplash.com/photo-1627000086207-76eabf23aa2e",
    title: "Camping Car",
  },
  {
    img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
    title: "Hats",
  },
  {
    img: "https://images.unsplash.com/photo-1567306301408-9b74779a11af",
    title: "Tomato basil",
  },
  {
    img: "https://images.unsplash.com/photo-1627328561499-a3584d4ee4f7",
    title: "Mountain",
  },
  {
    img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
    title: "Bike",
  },
];

function AlbumContent() {
  return (
    <Grid container spacing={1}>
      <Grid
        size={{ xs: 8 }}
        sx={{ overflow: "auto", height: getFullHeightSize(23) }}
      >
        <Grid container spacing={2}>
          {itemData.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
              key={index}
              sx={{ textAlign: "center" }}
            >
              <Box
                component="img"
                src={`${item.img}?w=162&auto=format`}
                alt={item.title}
                style={{
                  aspectRatio: "2/3",
                  display: "block",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <Typography variant="caption">123gsd.jpg</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid size={{ xs: 4 }} sx={{ background: "#EBEBEB" }}></Grid>
    </Grid>
  );
}

export default AlbumContent;
