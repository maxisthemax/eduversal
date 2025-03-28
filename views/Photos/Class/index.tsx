import { useParams } from "next/navigation";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";

//*components
import { Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

//*data
import { useUserCourse } from "@/data/userCourse/course";

function Class() {
  const { push } = useRouter();
  const { class_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);

  if (status === "pending") return <LinearProgress />;
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
        ]}
      >
        <Typography variant="h6" gutterBottom>
          <b>{userCourseData.title_format}</b>
        </Typography>
        <Divider />
        <Grid container spacing={2} sx={{ pt: 2 }}>
          {userCourseData.course.albums.map(
            ({ id: albumId, name, photos, product_type, preview_url }) => {
              return (
                <Grid spacing={2} key={albumId} size={{ xs: 2 }}>
                  <Stack>
                    <Button
                      onClick={() => push(`/photos/${class_id}/${albumId}`)}
                      sx={{ p: 0, pl: 2, pr: 2, border: "1px solid #B8BDC4" }}
                    >
                      <Box
                        component="img"
                        src={
                          preview_url !== ""
                            ? preview_url
                            : photos[0]?.display_url
                        }
                        sx={{
                          backgroundColor: "grey.300",
                          width: "100%",
                          height: "100%",
                          aspectRatio: "2/3",
                          objectFit:
                            product_type.type === "INDIVIDUAL"
                              ? "cover"
                              : "contain",
                        }}
                      />
                    </Button>
                    <Typography
                      gutterBottom
                      sx={{
                        pt: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <b>{name}</b>
                    </Typography>
                    <Typography variant="caption">
                      {photos?.length ?? 0} Photos
                    </Typography>
                    <Typography variant="caption">
                      Available until{" "}
                      {formatDate(
                        userCourseData.course.end_date,
                        "dd MMM yyyy"
                      )}
                    </Typography>
                  </Stack>
                </Grid>
              );
            }
          )}
        </Grid>
      </Page>
    </Container>
  );
}

export default Class;
