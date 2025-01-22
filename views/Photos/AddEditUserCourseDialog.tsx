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
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

//*data
import { CourseData } from "@/data/admin/institution/course";
import { useUserCourse } from "@/data/admin/userCourse/course";

//*utils
import axios from "@/utils/axios";
import { DialogTitle } from "@mui/material";

function AddEditUserCourseDialog() {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      <Button variant={"contained"} {...bindTrigger(popupState)}>
        Add Class
      </Button>
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {}}
      >
        <AddEditUserCourseDialogForm
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
  handleClose,
}: {
  handleClose: () => void;
}) {
  const { addUserCourse, isAdding } = useUserCourse();
  const [isChecking, setIsChecking] = useState(false);
  const [code, setCode] = useState("");
  const [data, setData] = useState<CourseData>(undefined);
  const [child, setChild] = useState<string[]>([""]);

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
              <Box
                sx={{
                  background: "#ECEDEF",
                  p: 2,
                  placeItems: "center",
                }}
              >
                <Grid container spacing={0.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      <b>Class Name :</b>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} sx={{ justifyItems: "start" }}>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      {data.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      <b>Expiration Date :</b>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} sx={{ justifyItems: "start" }}>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      {formatDate(data.end_date, "dd MMM yyyy")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Stack sx={{ alignItems: "start", width: "100%" }} spacing={2}>
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
          <DialogActions>
            <Button onClick={() => setData(undefined)}>Back</Button>
            <FlexBox />
            <Button
              variant="contained"
              onClick={async () => {
                if (child.every((name) => name.trim() !== "")) {
                  await addUserCourse(child, data.id);
                  handleClose();
                } else {
                  toast("Please fill in all child names", { type: "warning" });
                }
              }}
            >
              View Class Photos
            </Button>
          </DialogActions>
        </>
      ) : (
        <DialogContent>
          <Stack
            direction="column"
            spacing={3}
            sx={{ alignItems: "center", pl: 2, pr: 2, pb: 2 }}
          >
            <Box
              component="img"
              src={"/image/locked.png"}
              sx={{ width: "136px", height: "106px" }}
            />
            <Typography variant="h5">
              <b>Protected Content</b>
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 300 }}>
              Enter passcode to access the content.
            </Typography>
            <Box>
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
                    setData(data.data);
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
