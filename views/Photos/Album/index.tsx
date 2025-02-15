import { useParams, useRouter } from "next/navigation";

//*
import find from "lodash/find";

//*components
import { Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid2";

import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

//*data
import { useUserCourse } from "@/data/userCourse/course";

function Album() {
  const { push } = useRouter();
  const { class_id, album_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);

  if (status === "pending") return <LinearProgress />;

  const album = find(userCourseData.course.albums, {
    id: album_id as string,
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
        <Typography variant="h6" gutterBottom>
          <b>{userCourseData.title_format}</b>
        </Typography>
        <Divider />
        <Grid container spacing={3} sx={{ pt: 2 }}>
          {album.photos.map(({ id: photoId, display_url }) => {
            return (
              <Grid spacing={2} key={photoId} size={{ xs: 2 }}>
                <Stack>
                  <Button
                    sx={{ p: 0, pl: 2, pr: 2, border: "1px solid #B8BDC4" }}
                    onClick={() => {
                      push(`/photos/${class_id}/${album_id}/${photoId}`);
                    }}
                  >
                    <Box
                      component="img"
                      src={display_url ?? ""}
                      sx={{
                        backgroundColor: "grey.300",
                        width: "100%",
                        height: "100%",
                        aspectRatio: "2/3",
                        objectFit:
                          album.product_type.type === "INDIVIDUAL"
                            ? "cover"
                            : "contain",
                      }}
                    />
                  </Button>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Page>
    </Container>
  );
}

export default Album;
