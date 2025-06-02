import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";

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
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid2";

//*data
import { useUserCourse } from "@/data/userCourse/course";

//*utils
import { useHover } from "@/utils/function";

function Photos() {
  const { userCoursesData, status } = useUserCourse();
  if (status === "pending")
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  return (
    <Container maxWidth="lg">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: "28px" }} variant="h4">
          <b>Class ({userCoursesData?.length ?? 0})</b>
        </Typography>
        <AddEditUserCourseDialog />
      </Stack>
      <Stack spacing={2} sx={{ py: 2 }}>
        {userCoursesData && userCoursesData?.length > 0 ? (
          userCoursesData.map((userCourse, index) => {
            return <UserCourseItem key={index} userCourse={userCourse} />;
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Stack
              spacing={1}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "400px",
              }}
            >
              <Box
                draggable={false}
                component="img"
                src="/image/no_class.svg"
                width={"50%"}
              />
              <Typography variant="h5">
                <b>No Class Available</b>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No classes available or the class may have expired. Click ‘Add
                Class’ to access the class photo using the passcode from the
                teacher.
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}

export default Photos;

function UserCourseItem({ userCourse }) {
  const {
    id,
    names,
    course,
    title_format,
    academic_year_name,
    institution_name,
  } = userCourse;
  const { push } = useRouter();
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();

  return (
    <Paper
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        push(`/photos/${id}`);
      }}
      ref={hoverRef}
      key={id}
      elevation={0}
      sx={{
        p: 3,
        background: isHovered ? "#E9F0FE" : "background.paper",
        cursor: "pointer",
        "&:hover .MuiFab-root .MuiIcon-root": {
          transform: "rotate(45deg)",
          transition: "transform 0.3s ease-in-out",
        },
      }}
    >
      <Stack
        direction={"row"}
        spacing={3}
        sx={{ alignItems: { xs: "start", sm: "start", md: "center" } }}
      >
        <Box
          sx={(theme) => ({
            height: "119px",
            width: "119px",
            [theme.breakpoints.down("md")]: {
              height: "60px",
              width: "60px",
            },
            alignItems: "start",
          })}
        >
          {isHovered ? (
            <Box
              draggable={false}
              id="class-hover"
              component="img"
              src={"/image/class_hover.svg"}
              sx={(theme) => ({
                height: "119px",
                width: "119px",
                [theme.breakpoints.down("md")]: {
                  height: "60px",
                  width: "60px",
                },
              })}
            />
          ) : (
            <Box
              draggable={false}
              id="class"
              component="img"
              src={"/image/class.svg"}
              sx={(theme) => ({
                height: "119px",
                width: "119px",
                [theme.breakpoints.down("md")]: {
                  height: "60px",
                  width: "60px",
                },
              })}
            />
          )}
        </Box>
        <Stack sx={{ width: "100%" }}>
          <Typography variant="body1">{academic_year_name}</Typography>
          <Typography variant="h6">
            <b>{title_format}</b>
          </Typography>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 7 }}>
              <Stack
                direction={"row"}
                spacing={2}
                sx={{ pr: { xs: 0, sm: 0, md: 2 } }}
              >
                <Stack
                  spacing={1}
                  direction={"row"}
                  sx={{ alignItems: "start", maxWidth: "500px" }}
                >
                  <CustomIcon icon="person" fontSizeSx="20px" />
                  <Typography variant="body2">
                    {(names as string[]).map((name) => name).join(", ")}
                  </Typography>
                </Stack>
                <FlexBox />
                <AddEditUserCourseDialog mode="edit" id={id} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 2.5 }}>
              <Stack direction={"row"} spacing={1} sx={{ alignItems: "start" }}>
                <CustomIcon icon="location_on" fontSizeSx="20px" />
                <Typography variant="body2">{institution_name}</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 2.5 }}>
              <Stack direction={"row"} spacing={1} sx={{ alignItems: "start" }}>
                <CustomIcon icon="imagesmode" fontSizeSx="20px" />
                <Typography variant="body2">
                  {course.albums.length} Albums |{" "}
                  {sum(course.albums.map(({ photos }) => photos.length))} Photos
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ pt: 2 }} color="error">
            Avaliable until {formatDate(course.end_date, "dd MMM yyyy")}
          </Typography>
        </Stack>
        <FlexBox sx={{ display: { xs: "none", sm: "none", md: "block" } }} />
        <Box sx={{ display: { xs: "none", sm: "none", md: "block" } }}>
          <Fab
            variant="circular"
            size="medium"
            color="primary"
            onClick={() => push(`/photos/${id}`)}
            sx={{
              boxShadow: 0,
            }}
          >
            <CustomIcon icon="arrow_forward" fontSizeSx="32px" />
          </Fab>
        </Box>
      </Stack>
    </Paper>
  );
}
