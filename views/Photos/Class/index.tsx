import { useParams } from "next/navigation";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";

//*components
import { FlexBox, Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

//*data
import { useUserCourse } from "@/data/userCourse/course";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function Class() {
  const { push } = useRouter();
  const { class_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);

  if (status === "pending") return <LinearProgress />;
  return (
    <Container maxWidth="lg">
      <Page
        isLoading={status === "pending"}
        disabledLinkButton={true}
        links={[
          { href: "/photos", title: "Class" },
          {
            href: `/photos/${class_id}`,
            title: "Albums",
          },
        ]}
      >
        <Typography sx={{ fontSize: "28px" }} gutterBottom>
          <b>Albums</b>
        </Typography>
        <Paper
          variant="elevation"
          elevation={0}
          sx={{ p: 4, overflow: "auto", height: getFullHeightSize(30) }}
        >
          <Stack direction={"row"}>
            <Typography sx={{ fontSize: "22px" }} gutterBottom>
              <b>
                {userCourseData.title_format} (
                {userCourseData.course.academicYear.year.toString()})
              </b>
            </Typography>
            <FlexBox />
            <Typography variant="body1" color="error">
              Available until{" "}
              {formatDate(userCourseData.course.end_date, "dd MMM yyyy")}
            </Typography>
          </Stack>
          <Grid container spacing={4} sx={{ pt: 2 }}>
            {userCourseData.course.albums.map(
              ({ id: albumId, name, photos, preview_url }) => {
                return (
                  <Grid key={albumId} size={{ xs: 3 }}>
                    <Stack>
                      <Button
                        disableRipple
                        onClick={() => push(`/photos/${class_id}/${albumId}`)}
                        sx={{
                          p: 0,
                          backgroundColor: "#f2f2f2",
                          ":hover": { backgroundColor: "#d9d9d9" },
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            preview_url !== ""
                              ? preview_url
                              : photos[0]?.display_url
                          }
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            objectFit: "contain",
                          }}
                        />
                      </Button>
                      <Typography
                        sx={{
                          pt: 0.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "18px",
                        }}
                      >
                        <b>{name}</b>
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "16px" }}>
                        {photos?.length ?? 0} Photos
                      </Typography>
                    </Stack>
                  </Grid>
                );
              }
            )}
          </Grid>
        </Paper>
      </Page>
    </Container>
  );
}

export default Class;
