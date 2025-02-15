import { useParams } from "next/navigation";

//*lodash
import find from "lodash/find";

//*components
import { CustomIcon } from "@/components/Icons";
import { Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

//*data
import { useUserCourse } from "@/data/userCourse/course";

function Photo() {
  const { class_id, album_id, photo_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);

  if (status === "pending") return <LinearProgress />;

  const album = find(userCourseData.course.albums, {
    id: album_id as string,
  });

  const photo = album.photos.find((photo) => {
    return photo.id === photo_id;
  });

  return (
    <Container maxWidth="xl">
      <Page
        isLoading={status === "pending"}
        disabledLinkButton={true}
        links={[
          { href: "/photos", title: "Class" },
          {
            href: `/photos/${class_id}`,
            title: "Albums",
          },
          {
            href: `/photos/${class_id}/${album_id}`,
            title: "Photo",
          },
        ]}
      >
        <Grid container>
          <Grid
            size={{ xs: 6 }}
            component={Paper}
            sx={{
              justifyContent: "center",
              display: "flex",
            }}
            variant="outlined"
          >
            <Paper
              variant="outlined"
              component="img"
              src={photo.display_url ?? ""}
              sx={{
                width: "80%",
                height: "100%",
                aspectRatio: "2/3",
                objectFit:
                  album.product_type.type === "INDIVIDUAL"
                    ? "cover"
                    : "contain",
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Stack sx={{ pl: 4, pr: 4 }} spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {album.product_type.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <b>{photo.name}</b>
                </Typography>
                <Typography variant="body1" color="primary" gutterBottom>
                  RM 10.00
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {"Child's Name"}
                </Typography>
                <TextField select>
                  {userCourseData.names.map((name) => {
                    return (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Box>
              {album.albumProductVariations.map(
                ({ productVariation }, index) => {
                  return (
                    <Box key={index}>
                      <ListItemText
                        primary={
                          productVariation.name +
                          `${
                            productVariation.is_downloadable
                              ? " (Downloadable)"
                              : ""
                          }`
                        }
                        secondary={productVariation.description}
                      />

                      <TextField
                        select
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            defaultValue: undefined,
                          },
                        }}
                      >
                        <MenuItem value={undefined}>
                          <ListItemText primary={`None`} />
                        </MenuItem>
                        {productVariation.options.map(
                          ({ id, name, price_format, description }) => {
                            return (
                              <MenuItem key={id} value={id}>
                                <ListItemText
                                  primary={`${name} - ${price_format}`}
                                  secondary={description}
                                />
                              </MenuItem>
                            );
                          }
                        )}
                      </TextField>
                    </Box>
                  );
                }
              )}
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" gutterBottom>
                  {"Packages"}
                </Typography>
                <Stack direction={"column"} spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ p: 2, justifyContent: "start" }}
                    color="primary"
                  >
                    <Stack direction="row" spacing={2}>
                      <CustomIcon icon="check_circle" />
                      <Typography variant="body1" gutterBottom>
                        No Package
                      </Typography>
                    </Stack>
                  </Button>
                  <Paper
                    fullWidth
                    variant="outlined"
                    component={Button}
                    sx={{ p: 2, justifyContent: "start" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <CustomIcon icon="check_circle" />
                      <ListItemText
                        sx={{ justifyItems: "start" }}
                        primary="Package A"
                        secondary="1 Individual + 1 Class - Formal"
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Page>
    </Container>
  );
}

export default Photo;
