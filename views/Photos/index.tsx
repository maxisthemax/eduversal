import { formatDate } from "date-fns";

//*components
import { FlexBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";

//*lodash
import sum from "lodash/sum";

//*mui
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";

function Photos() {
  return (
    <Container maxWidth="xl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 2 }}
      >
        <Typography variant="h6">Class (2)</Typography>
        <Button variant="contained">Add Class</Button>
      </Stack>
      <Stack spacing={2}>
        {[
          {
            id: 1,
            title: "Class Name - Class Standard (Year)",
            users: [{ name: "Yap Chung Lee" }, { name: "Yan Chung Wen" }],
            albums: [{ photos: ["23", "45"] }, { photos: ["sss", "111"] }],
            course: { date: new Date() },
          },
          {
            id: 2,
            title: "Class Name - Class Standard (Year)",
            users: [{ name: "Yap Chung Lee" }, { name: "Yan Chung Wen" }],
            albums: [{ photos: ["23", "45"] }, { photos: ["sss", "111"] }],
            course: { date: new Date() },
          },
        ].map(({ id, users, albums, course }) => {
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
                    <b>Class Name - Class Standard (Year)</b>
                  </Typography>
                  <Stack direction={"row"} spacing={2}>
                    <Typography variant="body2">
                      {users.map(({ name }) => name).join(", ")}
                    </Typography>
                    <Link href="#" variant="caption" underline="hover">
                      Edit
                    </Link>
                  </Stack>
                  <Typography variant="body2">
                    {albums.length} Albums |{" "}
                    {sum(albums.map(({ photos }) => photos.length))} Photos
                  </Typography>
                  <Typography variant="body2">
                    Avaliable until {formatDate(course.date, "dd MMM yyyy")}
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
