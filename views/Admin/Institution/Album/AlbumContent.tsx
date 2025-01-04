import { useParams } from "next/navigation";
import { format } from "date-fns";

//*mui
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { useCourses } from "@/data/admin/institution/course";

function AlbumContent({ albumId }: { albumId: string }) {
  const params = useParams();
  const courseId = params.courseId as string;

  //*data
  const { albumData } = useAlbums(albumId);
  const { courseData } = useCourses(courseId);

  return (
    <Grid container spacing={1}>
      <Grid
        size={{ xs: 8 }}
        sx={{ overflow: "auto", height: getFullHeightSize(23) }}
      >
        <Grid container spacing={2}>
          {/* {photos.map((item, index) => (
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
          ))} */}
        </Grid>
      </Grid>
      <Grid size={{ xs: 4 }} sx={{ background: "#EBEBEB" }}>
        <Grid container sx={{ p: 2 }} rowGap={1}>
          <Grid size={{ xs: 12 }}>
            <Typography>
              <b>Album Details</b>
            </Typography>
          </Grid>
          <NameValue name="Name" value={albumData.name} />
          <NameValue
            name="Created"
            value={format(albumData.created_at, "PP")}
          />
          <NameValue
            name="Available Unitl"
            value={format(courseData.end_date, "PP")}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default AlbumContent;

function NameValue({ name, value }: { name: string; value: string }) {
  return (
    <>
      <Grid size={{ xs: 4 }}>
        <Typography variant="subtitle2">
          <b>{name}</b>
        </Typography>
      </Grid>
      <Grid size={{ xs: 8 }}>
        <Typography variant="subtitle2">{value}</Typography>
      </Grid>
    </>
  );
}
