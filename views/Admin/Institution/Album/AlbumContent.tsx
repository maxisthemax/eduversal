import { useParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
  bindDialog,
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import PopupState from "material-ui-popup-state";

//*lodash
import includes from "lodash/includes";

//*components
import { useCustomDialog } from "@/components/Dialog";
import AddEditAlbumDialog from "./AddEditAlbumDialog";
import { FlexBox, OverlayBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";

//*mui
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { useCourses } from "@/data/admin/institution/course";
import { usePhotos } from "@/data/admin/institution/photo";

//*utils
import axios from "@/utils/axios";

function AlbumContent({ albumId }: { albumId: string }) {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;
  const { handleOpenDialog } = useCustomDialog();

  const popupState = usePopupState({ variant: "dialog", popupId: "upload" });
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((files) => {
      return [...files, ...acceptedFiles];
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    onError: (error) => {
      console.log(error);
    },
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    onDropRejected: (fileRejections) => {
      toast.error(
        fileRejections.map((file) => file.errors[0].message).join(`\n`)
      );
    },
    validator: (file) => {
      if (file.size > 10 * 1024 * 1024) {
        return {
          code: "size-too-large",
          message: `file is larger than 10MB`,
        };
      }
      return null;
    },
  });

  //*states
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selection, setSelection] = useState<string[]>([]);

  //*data
  const { albumData } = useAlbums(albumId);
  const { courseData } = useCourses(courseId);
  const { addPhoto, photosData, deletePhoto } = usePhotos(albumId);

  //*function
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append(
      "folderPath",
      `institution/${institutionId}/album/${albumId}`
    );
    files.forEach((file) => {
      formData.append("files", file);
    });
    try {
      setIsUploading(true);
      const res = await axios.post("photoUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await addPhoto(res.data);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading files:", error);
    }

    setFiles([]);
  };

  const handleDelete = async () => {
    handleOpenDialog({
      allowOutsideClose: false,
      title: "Are you to sure delete?",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await deletePhoto(selection);
          setSelection([]);
          setIsDeleting(false);
        } catch (error) {
          setIsDeleting(false);
          console.error("Error uploading files:", error);
        }
      },
    });
  };

  return (
    <OverlayBox isLoading={isDeleting || isUploading}>
      <Grid container spacing={1}>
        <Grid
          size={{ xs: 8 }}
          sx={{ overflow: "auto", height: getFullHeightSize(23) }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Stack
                spacing={2}
                direction="row"
                sx={{
                  justifyContent: "flex-end",
                  top: 0,
                  background: "white",
                  zIndex: 1,
                  width: "100%",
                }}
              >
                {selection.length > 0 && (
                  <Button variant="contained" onClick={handleDelete}>
                    DELETE
                  </Button>
                )}
                <Button variant="contained" {...bindTrigger(popupState)}>
                  Upload
                </Button>
              </Stack>
              <Dialog
                maxWidth="lg"
                {...bindDialog(popupState)}
                onClose={() => {}}
              >
                <OverlayBox isLoading={isUploading}>
                  <DialogContent sx={{ minWidth: 400 }}>
                    <Grid
                      container
                      spacing={2}
                      direction="row"
                      sx={{
                        maxHeight: getFullHeightSize(28),
                        overflow: "auto",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                      }}
                    >
                      {files.map((file, index) => {
                        return (
                          <Grid
                            size={{ xs: 1.5 }}
                            key={index}
                            sx={{
                              textAlign: "center",
                              position: "relative",
                              "&:hover .delete": {
                                display: "block",
                              },
                            }}
                          >
                            <Box
                              className="delete"
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                display: "none",
                              }}
                            >
                              <IconButton
                                disableRipple
                                disableTouchRipple
                                disableFocusRipple
                                sx={{ background: "white", m: 0.5 }}
                                color="primary"
                                size="small"
                                onClick={() => {
                                  setFiles((files) =>
                                    files.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                <CustomIcon icon="delete" fontSizeSx="20px" />
                              </IconButton>
                            </Box>
                            <Box
                              component="img"
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{
                                aspectRatio: "2/3",
                                display: "block",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <Typography variant="caption">
                              {file.name}
                            </Typography>
                          </Grid>
                        );
                      })}
                    </Grid>
                    <Stack sx={{ pt: 1 }}>
                      <Typography variant="caption">
                        * Maximum file size is 10MB are allowed
                      </Typography>
                      <Typography variant="caption">
                        * Only .jpeg and .png files are allowed
                      </Typography>
                    </Stack>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        popupState.close();
                        setFiles([]);
                      }}
                    >
                      Close
                    </Button>
                    <FlexBox />
                    <Box
                      {...getRootProps()}
                      sx={{
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input {...getInputProps()} />
                      <Button variant="contained" color="primary">
                        Select Files
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      disabled={files.length === 0}
                      onClick={handleUpload}
                    >
                      Upload
                    </Button>
                  </DialogActions>
                </OverlayBox>
              </Dialog>
            </Grid>
            {photosData.map((item, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                key={index}
                sx={{
                  textAlign: "center",
                  position: "relative",
                  "&:hover .checkbox": {
                    display: "block",
                  },
                }}
              >
                <PopupState variant="popover" popupId="demo-popup-popover">
                  {(popupState) => (
                    <>
                      <Button sx={{ p: 0 }} {...bindTrigger(popupState)}>
                        <Box
                          className="checkbox"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            display: !includes(selection, item.id)
                              ? "none"
                              : "block",
                          }}
                        >
                          <Checkbox
                            checked={includes(selection, item.id)}
                            size="small"
                            disableRipple
                            sx={{
                              background: "white",
                              p: 0,
                              borderRadius: 0,
                              m: 0,
                            }}
                            onClick={() => {
                              if (!includes(selection, item.id)) {
                                setSelection((selection) => [
                                  ...selection,
                                  item.id,
                                ]);
                              } else {
                                setSelection((selection) =>
                                  selection.filter((id) => id !== item.id)
                                );
                              }
                            }}
                          />
                        </Box>
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
                      </Button>
                      <Menu
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        sx={{ p: 0 }}
                      >
                        <MenuItem
                          onClick={async () => {
                            const res = await axios.get(
                              `admin/photo/getPhoto?fileKey=${item.download_url}`
                            );
                            const link = document.createElement("a");
                            link.href = res.data.url;
                            link.download = item.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          Download
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </PopupState>

                <Typography
                  variant="caption"
                  sx={{ overflowWrap: "break-word" }}
                >
                  {item.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 4 }} sx={{ background: "#EBEBEB" }}>
          <Grid container sx={{ p: 2 }} rowGap={0.5}>
            <Grid size={{ xs: 10 }} sx={{ alignContent: "center" }}>
              <Typography>
                <b>Album Details</b>
              </Typography>
            </Grid>
            <Grid size={{ xs: 1 }}>
              <AddEditAlbumDialog mode="edit" albumId={albumData.id} />
            </Grid>
            <NameValue name="Name" value={albumData.name} />
            <NameValue name="Type" value={albumData.type_format} />
            <NameValue name="Total Files" value={photosData.length} />
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
    </OverlayBox>
  );
}

export default AlbumContent;

function NameValue({ name, value }: { name: string; value: string | number }) {
  return (
    <>
      <Grid size={{ xs: 4 }}>
        <Typography variant="subtitle2" fontWeight={400}>
          {name}
        </Typography>
      </Grid>
      <Grid size={{ xs: 8 }}>
        <Typography variant="subtitle2" fontWeight={400}>
          {value}
        </Typography>
      </Grid>
    </>
  );
}
