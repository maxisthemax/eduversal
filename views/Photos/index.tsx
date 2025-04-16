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
import Collapse from "@mui/material/Collapse";

//*data
import { useUserCourse } from "@/data/userCourse/course";
import { useHover } from "@/utils/function";
import { getFullHeightSize } from "@/helpers/stringHelpers";

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
        sx={{ p: 2 }}
      >
        <Typography variant="h6">
          Class ({userCoursesData?.length ?? 0})
        </Typography>
        <AddEditUserCourseDialog />
      </Stack>
      <Stack
        spacing={2}
        sx={{ py: 2, overflow: "auto", height: getFullHeightSize(26) }}
      >
        {userCoursesData.map((userCourse, index) => {
          return <UserCourseItem key={index} userCourse={userCourse} />;
        })}
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
      <Stack direction={"row"} spacing={3} sx={{ alignItems: "center" }}>
        <Box sx={{ width: "119px", height: "119px" }}>
          <Collapse
            in={isHovered}
            timeout={{ appear: 500, enter: 500, exit: 0 }}
            orientation="horizontal"
            mountOnEnter
            unmountOnExit
            collapsedSize={1}
          >
            <Box
              id="class-hover"
              component="img"
              src={"/image/class_hover.svg"}
              height={"119px"}
              width={"119px"}
              sx={{ height: "119px", width: "119px" }}
            />
          </Collapse>
          <Collapse
            in={!isHovered}
            timeout={{ appear: 200, enter: 200, exit: 0 }}
            orientation="horizontal"
            mountOnEnter
            unmountOnExit
            collapsedSize={1}
          >
            <Box
              id="class"
              component="img"
              src={"/image/class.svg"}
              height={"119px"}
              width={"119px"}
              sx={{ height: "119px", width: "119px" }}
            />
          </Collapse>
        </Box>

        <Stack>
          <Typography variant="body1">{academic_year_name}</Typography>
          <Typography variant="h6">
            <b>{title_format}</b>
          </Typography>
          <Stack direction={"row"} spacing={8}>
            <Stack direction={"row"} spacing={2}>
              <Stack
                direction={"row"}
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <CustomIcon icon="person" fontSizeSx="20px" />
                <Typography variant="body2">
                  {names.map((name) => name).join(", ")}
                </Typography>
              </Stack>
              <AddEditUserCourseDialog mode="edit" id={id} />
            </Stack>
            <Stack direction={"row"} spacing={1} sx={{ alignItems: "center" }}>
              <CustomIcon icon="location_on" fontSizeSx="20px" />
              <Typography variant="body2">{institution_name}</Typography>
            </Stack>
            <Stack direction={"row"} spacing={1} sx={{ alignItems: "center" }}>
              <CustomIcon icon="imagesmode" fontSizeSx="20px" />
              <Typography variant="body2">
                {course.albums.length} Albums |{" "}
                {sum(course.albums.map(({ photos }) => photos.length))} Photos
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ pt: 2 }} color="error">
            Avaliable until {formatDate(course.end_date, "dd MMM yyyy")}
          </Typography>
        </Stack>
        <FlexBox />
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
      </Stack>
    </Paper>
  );
}
