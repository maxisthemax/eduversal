import { toast } from "react-toastify";
import { useState } from "react";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { formatDate } from "date-fns";

//*components
import { FlexBox, OverlayBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";

//*material
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";

//*data
import { UserCourseData, useUserCourse } from "@/data/userCourse/course";

//*utils
import axios from "@/utils/axios";

function AddEditUserCourseDialog({
  mode = "add",
  id,
}: {
  mode?: "add" | "edit";
  id?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      {mode === "edit" ? (
        <Link
          variant="body2"
          underline="hover"
          sx={{ cursor: "pointer" }}
          onClick={(e) => {
            popupState.open(e);
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Edit
        </Link>
      ) : (
        <Button
          variant={"contained"}
          {...bindTrigger(popupState)}
          startIcon={<CustomIcon icon="add" />}
        >
          Add Class
        </Button>
      )}
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {}}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <AddEditUserCourseDialogForm
          mode={mode}
          id={id}
          handleClose={() => {
            popupState.close();
          }}
        />
      </Dialog>
    </>
  );
}

export default AddEditUserCourseDialog;

function AddEditUserCourseDialogForm({
  mode,
  id,
  handleClose,
}: {
  mode: "add" | "edit";
  id: string;
  handleClose: () => void;
}) {
  const { addUserCourse, isAdding, updateUserCourse, userCourseData } =
    useUserCourse(id);
  const [isChecking, setIsChecking] = useState(false);
  const [code, setCode] = useState("");
  const [data, setData] = useState<UserCourseData | undefined>(
    mode === "edit" ? userCourseData : undefined
  );
  const [child, setChild] = useState<string[]>(
    mode === "edit" ? userCourseData.names : [""]
  );

  return (
    <OverlayBox isLoading={isAdding || isChecking}>
      <DialogTitle sx={{ textAlign: "end" }}>
        <IconButton size="small" onClick={handleClose}>
          <CustomIcon icon="close" fontSize="small" />
        </IconButton>
      </DialogTitle>
      {data ? (
        <>
          <DialogContent>
            <Stack
              direction="column"
              spacing={3}
              sx={{
                alignItems: "center",
                pl: 2,
                pr: 2,
                pb: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h5">
                <b>{"Add Your Child's Name"}</b>
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 300 }}>
                Enter your child’s name to access their class photos. If you
                have more than one child in this class, you can add their names
                too.
              </Typography>

              <Stack sx={{ background: "#ECEDEF", p: 2 }} spacing={1}>
                <Stack direction={"row"} spacing={2}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 300, width: "120px", textAlign: "end" }}
                  >
                    <b>Class Name :</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 300,
                      textAlign: "start",
                      maxWidth: "300px",
                    }}
                  >
                    {data.title_format}
                  </Typography>
                </Stack>
                <Stack direction={"row"} spacing={2} sx={{ width: "100%" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 300, width: "120px", textAlign: "end" }}
                  >
                    <b>Expiration Date :</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 300,
                      textAlign: "start",
                      maxWidth: "300px",
                    }}
                  >
                    {formatDate(data.course.end_date, "dd MMM yyyy")}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{ alignItems: "start", width: "100%", maxHeight: "250px" }}
                spacing={2}
              >
                <Typography>{"Child's Name"}</Typography>
                {child.map((name, index) => (
                  <TextField
                    onChange={(e) => {
                      const newChild = [...child];
                      newChild[index] = e.target.value;
                      setChild(newChild);
                    }}
                    value={name}
                    key={index}
                    fullWidth
                    placeholder="Enter your child's name"
                    slotProps={{
                      input: {
                        endAdornment: child.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newChild = [...child];
                              newChild.splice(index, 1);
                              setChild(newChild);
                            }}
                          >
                            <CustomIcon icon="delete" fontSize="small" />
                          </IconButton>
                        ),
                      },
                    }}
                  />
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setChild([...child, ""])}
                >
                  + Add Another Child
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() =>
                mode === "add" ? setData(undefined) : handleClose()
              }
            >
              Back
            </Button>
            <FlexBox />
            <Button
              variant="contained"
              onClick={async () => {
                if (child.every((name) => name.trim().length > 0)) {
                  if (mode === "add") {
                    await addUserCourse(child, data.course_id);
                  } else {
                    await updateUserCourse(child, data.id);
                  }

                  handleClose();
                } else {
                  toast("Please fill in all child names", { type: "warning" });
                }
              }}
            >
              {mode === "add" ? "   View Class Photos" : "Update"}
            </Button>
          </DialogActions>
        </>
      ) : (
        <DialogContent>
          <Stack
            direction="column"
            spacing={3}
            sx={{
              alignItems: "center",
              pl: { xs: 0, sm: 0, md: 2 },
              pr: { xs: 0, sm: 0, md: 2 },
              pb: { xs: 0, sm: 0, md: 2 },
            }}
          >
            <Box
              component="img"
              src={"/image/locked.svg"}
              sx={{ width: "136px", height: "106px" }}
            />
            <Typography variant="h5">
              <b>Protected Content</b>
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 300 }}>
              Enter passcode to access the content.
            </Typography>
            <Box
              sx={{
                width: { xs: "100%", sm: "100%", md: "inherit" },
              }}
            >
              <TextField
                value={code}
                fullWidth
                placeholder="Passcode"
                sx={{ pb: 2 }}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                disabled={code === ""}
                fullWidth
                variant="contained"
                onClick={async () => {
                  setIsChecking(true);
                  const data = await axios.get(`course/${code}`);
                  if (data?.data) {
                    setData({
                      course: data.data,
                      id: "",
                      names: [],
                      course_id: data.data.id,
                      title_format:
                        data.data.name +
                        " - " +
                        data.data.standard.name +
                        " - " +
                        data.data.academicYear.name +
                        " (" +
                        data.data.academicYear.year.toString() +
                        ")",
                    });
                  } else {
                    toast("Invalid Passcode", { type: "error" });
                  }
                  setIsChecking(false);
                }}
              >
                Unlock
              </Button>
            </Box>
            <Divider sx={{ width: "100%" }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 300 }}>
                Please obtain the passcode from the class teacher or the
                relevant authority.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 300 }}>
                • The content is restricted to protect individual photos from
                being
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 300 }}>
                • Enter the passcode to be redirected to the specific page.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 300 }}>
                • All passcodes are only active for a limited time they were
                issued by the teacher.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 300 }}>
                • If you need access to photos from previous years, please
                contact us for assistance.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      )}
    </OverlayBox>
  );
}
