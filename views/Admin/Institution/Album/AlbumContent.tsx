import { useParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
  bindDialog,
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useState, isValidElement } from "react";
import PopupState from "material-ui-popup-state";
import { toast } from "react-toastify";

//*lodash
import some from "lodash/some";
import includes from "lodash/includes";

//*components
import useUpload from "@/components/useUpload";
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
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { useCourses } from "@/data/admin/institution/course";
import { usePhotos } from "@/data/admin/institution/photo";
import { useProductVariation } from "@/data/admin/productVariation";
import { useGetStaffAccess } from "@/data/admin/user/staff";

//*utils
import axios from "@/utils/axios";

function AlbumContent({ albumId }: { albumId: string }) {
  const access = useGetStaffAccess("restrict_content_album");
  const params = useParams();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;
  const { handleOpenDialog } = useCustomDialog();
  const popupState = usePopupState({ variant: "dialog", popupId: "upload" });

  //*data
  const { albumData, status } = useAlbums(albumId);
  const { courseData } = useCourses(courseId);
  const { addPhoto, photosData, deletePhoto } = usePhotos(albumId);
  const { productVariationsById, status: productVariationsStatus } =
    useProductVariation();

  //*upload hook
  const {
    files,
    setFiles,
    isUploading,
    getRootProps,
    getInputProps,
    handleUpload,
  } = useUpload(`institution/${institutionId}/album/${albumId}`, {
    watermark: true,
  });

  //*states
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selection, setSelection] = useState<string[]>([]);

  //*function
  const handleDelete = async () => {
    handleOpenDialog({
      allowOutsideClose: false,
      title: "Are you to sure delete?",
      onConfirm: async () => {
        try {
          const photosToDelete = photosData.filter((photo) =>
            selection.includes(photo.id)
          );

          if (some(photosToDelete, (photo) => photo.purchase_count > 0)) {
            toast.error(
              `You cannot delete purchased photos, ${photosToDelete
                .map((photo) => photo.name)
                .join(",")}`
            );

            return;
          }

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

  const handleUploadAndAddPhoto = async () => {
    const data = await handleUpload();
    if (data) {
      await addPhoto(data);
    }
  };

  if (status === "pending" || productVariationsStatus === "pending")
    return <LinearProgress />;

  return (
    <OverlayBox isLoading={isDeleting || isUploading}>
      <Paper sx={{ px: 2 }}>
        <Grid container spacing={1}>
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
              <Typography variant="body1">
                <b>{courseData.name}</b>
              </Typography>
              <FlexBox />
              {selection.length > 0 && access.delete && (
                <Button variant="contained" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              {access.edit && (
                <AddEditAlbumDialog mode="edit" albumId={albumData.id} />
              )}
              {access.edit && (
                <Button variant="contained" {...bindTrigger(popupState)}>
                  Upload
                </Button>
              )}
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
                          size={{
                            xs:
                              albumData.product_type.type === "INDIVIDUAL"
                                ? 1.5
                                : 2,
                          }}
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
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "contain",
                              backgroundColor: "#f2f2f2",
                            }}
                          />
                          <Typography variant="caption">{file.name}</Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Stack sx={{ pt: 1 }}>
                    <Typography variant="caption">
                      * Maximum file size is 30MB are allowed
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
                    onClick={handleUploadAndAddPhoto}
                  >
                    Upload
                  </Button>
                </DialogActions>
              </OverlayBox>
            </Dialog>
          </Grid>
          <Grid
            size={{ xs: 8.5 }}
            sx={{ overflow: "auto", height: getFullHeightSize(37) }}
          >
            <Grid container spacing={2}>
              {photosData.map((item, index) => (
                <Grid
                  size={{
                    xs: 2.5,
                  }}
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
                        <Button
                          disableRipple
                          sx={{ p: 0 }}
                          {...bindTrigger(popupState)}
                        >
                          <Box
                            className="checkbox"
                            sx={{
                              position: "absolute",
                              top: -2,
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
                                zIndex: 1,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
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
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "contain",
                              backgroundColor: "#f2f2f2",
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
                          <MenuList dense={true} disablePadding>
                            <MenuItem
                              onClick={async () => {
                                const res = await axios.get(
                                  `admin/photo/downloadPhoto?fileKey=${item.download_url}`
                                );
                                const link = document.createElement("a");
                                link.href = res.data.url;
                                link.download = item.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                popupState.close();
                              }}
                            >
                              Download
                            </MenuItem>
                          </MenuList>
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
          <Grid
            size={{ xs: 3.5 }}
            sx={{
              background: "#EBEBEB",
              height: getFullHeightSize(37),
              overflow: "auto",
            }}
          >
            <Grid container sx={{ p: 2 }} rowGap={0.5}>
              <Grid size={{ xs: 12 }} sx={{ alignContent: "center" }}>
                <Stack direction="row" sx={{ alignItems: "center" }}>
                  <Typography>
                    <b>Album Details</b>
                  </Typography>
                  <FlexBox />
                </Stack>
              </Grid>
              <NameValue name="Name" value={albumData.name} />
              <NameValue
                name="Status"
                value={
                  <Typography
                    variant="subtitle2"
                    fontWeight={400}
                    color={albumData.is_disabled ? "error" : "success"}
                  >
                    {albumData.is_disabled_format}
                  </Typography>
                }
              />
              <NameValue name="Description" value={albumData.description} />
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
                name="Available Until"
                value={format(courseData.end_date, "PP")}
              />
              <NameValue
                name=""
                value={
                  differenceInDays(courseData.end_date, new Date()) +
                  " days remaining"
                }
              />
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ alignContent: "center" }}>
                <Typography>
                  <b>Product Details</b>
                </Typography>
              </Grid>
              <NameValue name="Name" value={albumData.product_type.name} />
              <NameValue name="Type" value={albumData.product_type.type} />
              <NameValue
                name="Is Deliverable"
                value={albumData.product_type.is_deliverable_format}
              />
              <NameValue
                name="Price"
                value={albumData.product_type.price_format}
              />
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ alignContent: "center" }}>
                <Typography>
                  <b>Product Variations</b>
                </Typography>
              </Grid>
              {albumData.product_variations_id.map((productVariationId) => {
                const { name, description, options } =
                  productVariationsById[productVariationId];
                return (
                  <>
                    <NameValue name="Name" value={name} />
                    <NameValue name="Description" value={description} />
                    <Grid
                      size={{ xs: 12 }}
                      sx={{ mb: 1 }}
                      component={Paper}
                      variant="outlined"
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell width={100}>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {options.map(
                            ({ id, name, description, price_format }) => {
                              return (
                                <TableRow key={id}>
                                  <TableCell>{name}</TableCell>
                                  <TableCell>{description}</TableCell>
                                  <TableCell>{price_format}</TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </Grid>
                  </>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </OverlayBox>
  );
}

export default AlbumContent;

function NameValue({
  name,
  value,
}: {
  name: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <>
      <Grid size={{ xs: 4 }}>
        <Typography variant="subtitle2" fontWeight={400}>
          {name}
        </Typography>
      </Grid>
      <Grid size={{ xs: 8 }}>
        {isValidElement(value) ? (
          value
        ) : (
          <Typography variant="subtitle2" fontWeight={400}>
            {value}
          </Typography>
        )}
      </Grid>
    </>
  );
}
