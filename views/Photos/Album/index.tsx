import { useParams, useRouter } from "next/navigation";
import { formatDate } from "date-fns";

//*lodash
import find from "lodash/find";

//*components
import { FlexBox, Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

//*data
import { useUserCourse } from "@/data/userCourse/course";
import { useUserPackages } from "../UserPackage";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function Album() {
  const { push } = useRouter();
  const { class_id, album_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);
  const { setUserPackage } = useUserPackages();

  if (status === "pending") return <LinearProgress />;

  const album = find(userCourseData.course.albums, {
    id: album_id as string,
  });

  function handleSetPackage(
    photoId: string,
    display_url: string,
    download_url: string,
    name: string
  ) {
    setUserPackage({
      packageId: "none",
      packagePrice: album.product_type.price,
      itemsPrice: 0,
      currentStage: 0,
      firstStage: 0,
      packageData: undefined,
      cartId: undefined,
      items: [
        {
          album: {
            albumDescription: album.description,
            albumId: album.id,
            albumName: album.name,
            productType: album.product_type.type,
            productTypeId: album.product_type.id,
            productTypeName: album.product_type.name,
            productTypeDeliverable: album.product_type.is_deliverable,
            productTypeCurrency: album.product_type.currency,
            productTypePrice: album.product_type.price,
          },
          photoId: photoId,
          photoUrl: display_url,
          downloadUrl: download_url,
          photoName: name,
          name: userCourseData.names[0],
          productVariationOptions: [],
        },
      ],
    });
  }

  return (
    <Container maxWidth="lg">
      <Page
        isLoading={status === "pending"}
        links={[
          { href: "/photos", title: "Class" },
          {
            href: `/photos/${class_id}`,
            title: "Albums",
          },
          {
            href: `/photos/${class_id}/${album_id}`,
            title: "Photos",
          },
        ]}
        title="Photos"
      >
        <Paper
          variant="elevation"
          elevation={0}
          sx={{ p: 4, overflow: "auto", height: getFullHeightSize(38) }}
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
            {album.photos.map(
              ({ id: photoId, display_url, download_url, name }) => {
                return (
                  <Grid
                    spacing={2}
                    key={photoId}
                    size={{
                      xs: album.product_type.type === "INDIVIDUAL" ? 3 : 4,
                    }}
                  >
                    <Stack>
                      <Button
                        sx={{
                          p: 0,
                          backgroundColor: "#f2f2f2",
                          ":hover": { backgroundColor: "#d9d9d9" },
                        }}
                        onClick={() => {
                          handleSetPackage(
                            photoId,
                            display_url,
                            download_url,
                            name
                          );
                          push(`/photos/${class_id}/${album_id}/${photoId}`);
                        }}
                      >
                        <Box
                          component="img"
                          src={display_url ?? ""}
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            objectFit: "contain",
                          }}
                        />
                      </Button>
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

export default Album;
