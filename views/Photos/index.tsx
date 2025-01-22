import { formatDate } from "date-fns";

//*components
import { FlexBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";
import AddEditUserCourseDialog from "./AddEditUserCourseDialog";

//*lodash
import sum from "lodash/sum";

//*mui
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";

//*data
import { useUserCourse } from "@/data/admin/userCourse/course";

function Photos() {
  const { userCoursesData, status } = useUserCourse();

  if (status === "pending") return <LinearProgress />;
  return (
    <Container maxWidth="xl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 2 }}
      >
        <Typography variant="h6">
          Class ({userCoursesData?.length ?? 0})
        </Typography>
        <AddEditUserCourseDialog />
      </Stack>
      <Stack spacing={2}>
        {userCoursesData.map(({ id, names, course, title_format }) => {
          return (
            <Paper key={id} variant="outlined" sx={{ p: 3 }}>
              <Stack
                direction={"row"}
                spacing={3}
                sx={{ alignItems: "center" }}
              >
                <Box
                  component="img"
                  src={"/image/class.svg"}
                  sx={{ height: "91px" }}
                />
                <Stack>
                  <Typography variant="body1" gutterBottom>
                    <b>{title_format}</b>
                  </Typography>
                  <Stack direction={"row"} spacing={2}>
                    <Typography variant="body2">
                      {names.map((name) => name).join(", ")}
                    </Typography>
                    <Link
                      variant="body2"
                      underline="hover"
                      sx={{ cursor: "pointer" }}
                    >
                      Edit
                    </Link>
                  </Stack>
                  <Typography variant="body2">
                    {course.albums.length} Albums |{" "}
                    {sum(course.albums.map(({ photos }) => photos.length))}{" "}
                    Photos
                  </Typography>
                  <Typography variant="body2">
                    Avaliable until {formatDate(course.end_date, "dd MMM yyyy")}
                  </Typography>
                </Stack>
                <FlexBox />
                <IconButton color="primary">
                  <CustomIcon icon="arrow_forward" />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}

export default Photos;
