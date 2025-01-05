import { useParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

//*components
import AddEditAlbumDialog from "./AddEditAlbumDialog";
import Photo from "../Photo";
import { FlexBox } from "@/components/Box";

//*mui
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";

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

  const popupState = usePopupState({ variant: "dialog", popupId: "upload" });
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((files) => {
      return [...files, ...acceptedFiles];
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  //*states
  const [files, setFiles] = useState<File[]>([]);

  //*data
  const { albumData } = useAlbums(albumId);
  const { courseData } = useCourses(courseId);
  const { addPhoto } = usePhotos(albumId);

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
      const res = await axios.post("photoUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addPhoto(res.data);
    } catch (error) {
      console.error("Error uploading files:", error);
    }

    setFiles([]);
  };

  return (
    <Grid container spacing={1}>
      <Grid
        size={{ xs: 8 }}
        sx={{ overflow: "auto", height: getFullHeightSize(23) }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }} sx={{ textAlign: "end" }}>
            <Button variant="contained" {...bindTrigger(popupState)}>
              Upload
            </Button>
            <Dialog
              maxWidth="lg"
              {...bindDialog(popupState)}
              onClose={() => {}}
            >
              <DialogContent>
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
                        sx={{ textAlign: "center" }}
                      >
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
                        <Typography variant="caption">{file.name}</Typography>
                      </Grid>
                    );
                  })}
                </Grid>
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
            </Dialog>
          </Grid>
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
          <Grid size={{ xs: 1 }}>
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
