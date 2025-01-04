import { useParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";

//*components
import AddEditAlbumDialog from "./AddEditAlbumDialog";
import Photo from "../Photo";

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
          <Photo albumId={albumData.id} />
        </Grid>
      </Grid>
      <Grid size={{ xs: 4 }} sx={{ background: "#EBEBEB" }}>
        <Grid container sx={{ p: 2 }} rowGap={1}>
          <Grid size={{ xs: 10 }} sx={{ alignContent: "center" }}>
            <Typography>
              <b>Album Details</b>
            </Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <AddEditAlbumDialog mode="edit" albumId={albumData.id} />
          </Grid>
          <NameValue name="Name" value={albumData.name} />
          <NameValue name="Type" value={albumData.type_format} />
          <NameValue
            name="Created"
            value={format(albumData.created_at, "PP")}
          />
          <NameValue
            name="Updated"
            value={format(albumData.updated_at, "PP")}
          />
          <NameValue
            name="Available Unitl"
            value={format(courseData.end_date, "PP")}
          />
          <NameValue
            name=""
            value={
              differenceInDays(courseData.end_date, new Date()) +
              " days remaining"
            }
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
