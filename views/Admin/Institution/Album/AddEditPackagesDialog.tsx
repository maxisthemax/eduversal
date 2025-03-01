import { useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useParams } from "next/navigation";

//*find
import find from "lodash/find";

//*components
import { OverlayBox } from "@/components/Box";
import {
  TextFieldForm,
  TextFieldPriceForm,
  TextFieldAutocompleteForm,
} from "@/components/Form";
import { CustomIcon } from "@/components/Icons";
import useUpload from "@/components/useUpload";

//*material
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { usePackage } from "@/data/admin/institution/packages";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  currency: yup.string().required("Required"),
  price: yup.string().required("Required"),
  albums: yup
    .array()
    .min(1, "Required")
    .of(
      yup.object().shape({
        album_id: yup.string().required("Required"),
        quantity: yup.string().required("Required"),
      })
    ),
});

function AddEditPackagesDialog() {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      <Button variant={"contained"} {...bindTrigger(popupState)}>
        Manage Packages
      </Button>
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="md"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {}}
      >
        <AddEditPackagesDialogForm handleClose={() => popupState.close()} />
      </Dialog>
    </>
  );
}

export default AddEditPackagesDialog;

function AddEditPackagesDialogForm({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;
  const [addEdit, setAddEdit] = useState(false);
  const { albumsData, status } = useAlbums();
  const [packageId, setPackageId] = useState("");
  const { packageData, packagesData, addPackage, updatePackage } =
    usePackage(packageId);

  const { files, setFiles, getRootProps, getInputProps, handleUpload } =
    useUpload(`institution/${institutionId}/course/${courseId}/package`, {
      multiple: false,
    });

  if (status === "pending") return <LinearProgress />;

  return !addEdit ? (
    <>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid
            size={{ xs: 3 }}
            component={Button}
            variant="outlined"
            sx={{ textAlign: "inherit", flexDirection: "column" }}
            onClick={() => setAddEdit(true)}
          >
            <CustomIcon icon="add" fontSizeSx="60px" />
            <Box sx={{ p: 1 }} />
            <Typography variant="caption">Add New Package</Typography>
          </Grid>
          {packagesData.map(
            ({
              id,
              preview_url,
              name,
              description,
              is_downloadable,
              price_format,
              package_type_format,
            }) => {
              return (
                <Grid
                  size={{ xs: 3 }}
                  component={Button}
                  variant="text"
                  color="inherit"
                  sx={{ textAlign: "inherit" }}
                  key={id}
                  onClick={() => {
                    setPackageId(id);
                    setAddEdit(true);
                  }}
                >
                  <Stack spacing={1} sx={{ width: "100%" }}>
                    <Box
                      component={"img"}
                      src={
                        preview_url !== ""
                          ? preview_url
                          : "https://placehold.co/600x400?text=No Image"
                      }
                      sx={{
                        width: "100%",
                        height: "150px",
                        objectFit: "contain",
                      }}
                    />
                    <Typography variant="caption">Name: {name}</Typography>
                    <Typography variant="caption">
                      Description: {description}
                    </Typography>
                    <Typography variant="caption">
                      Downloadable: {is_downloadable ? "Yes" : "No"}
                    </Typography>
                    <Typography variant="caption">
                      Price: {price_format}
                    </Typography>
                    <Typography variant="caption">
                      {package_type_format}
                    </Typography>
                  </Stack>
                </Grid>
              );
            }
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
            setPackageId("");
            setFiles([]);
          }}
        >
          Close
        </Button>
      </DialogActions>
    </>
  ) : (
    <Formik
      initialValues={
        packageData
          ? {
              name: packageData.name,
              is_downloadable: packageData.is_downloadable,
              description: packageData.description,
              currency: packageData.currency,
              price: packageData.price,
              preview_url: packageData.preview_url,
              preview_url_key: packageData.preview_url_key,
              albums: packageData.packageAlbums,
            }
          : {
              name: "",
              is_downloadable: true,
              description: "",
              currency: "RM",
              price: 0,
              preview_url: "",
              preview_url_key: "",
              albums: [],
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        if (files.length === 1) {
          const res = await handleUpload();
          values.preview_url = res[0].display_url;
          values.preview_url_key = res[0].download_url;
        }
        try {
          if (packageId) {
            await updatePackage(packageId, values);
          } else {
            await addPackage(values);
          }

          resetForm();
          setAddEdit(false);
        } catch (e: unknown) {
          console.error(e);
        }
      }}
    >
      {({
        values,
        errors,
        isSubmitting,
        submitForm,
        handleChange,
        resetForm,
        touched,
        handleBlur,
        setFieldValue,
      }) => {
        const formProps = {
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
        };

        return (
          <OverlayBox isLoading={isSubmitting}>
            <Form>
              <DialogTitle>Manage Packages</DialogTitle>
              <DialogContent>
                <Stack
                  p={1}
                  direction="column"
                  spacing={2}
                  sx={{ maxHeight: getFullHeightSize(27), overflow: "auto" }}
                >
                  <TextFieldForm
                    name="name"
                    label="Name"
                    formProps={formProps}
                    props={{ required: true }}
                  />
                  <TextFieldForm
                    name="description"
                    label="Description"
                    formProps={formProps}
                    props={{ minRows: 3, multiline: true }}
                  />
                  {(files.length > 0 || packageData?.preview_url) && (
                    <Box
                      sx={{
                        textAlign: "center",
                        position: "relative",
                        "&:hover .delete": {
                          display: "block",
                        },
                        height: "350px",
                        width: "100%",
                        background: "#EBEBEB",
                        m: 2,
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
                        {files.length > 0 && (
                          <IconButton
                            disableRipple
                            disableTouchRipple
                            disableFocusRipple
                            sx={{ background: "white", m: 0.5 }}
                            color="primary"
                            size="small"
                            onClick={() => {
                              setFiles([]);
                            }}
                          >
                            <CustomIcon icon="delete" fontSizeSx="20px" />
                          </IconButton>
                        )}
                      </Box>
                      <Box
                        component="img"
                        src={
                          files.length > 0
                            ? URL.createObjectURL(files[0])
                            : packageData?.preview_url
                        }
                        alt={files[0]?.name ?? packageData?.preview_url}
                        sx={{
                          display: "block",
                          width: "100%",
                          height: "inherit",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  )}
                  <Box
                    {...getRootProps()}
                    sx={{
                      cursor: "pointer",
                      pb: 1,
                    }}
                  >
                    <input {...getInputProps()} />
                    <Button variant="contained" color="primary">
                      Select Files
                    </Button>
                  </Box>
                  <Stack spacing={2} direction="row">
                    <TextFieldForm
                      name="currency"
                      label="Currency"
                      formProps={formProps}
                      props={{
                        select: true,
                        required: true,
                        sx: { maxWidth: 120 },
                      }}
                    >
                      <MenuItem value="RM">RM</MenuItem>
                    </TextFieldForm>
                    <TextFieldPriceForm
                      name="price"
                      label="Price"
                      formProps={formProps}
                      props={{ required: true }}
                    />
                  </Stack>
                  <Divider />
                  <Autocomplete
                    fullWidth
                    multiple
                    options={albumsData.map(({ id }) => id)}
                    getOptionLabel={(id) => {
                      const findOption = find(albumsData, { id });
                      return findOption?.name;
                    }}
                    onChange={(e, value) => {
                      const album = value.map((id) => {
                        const quantity = values.albums.find(
                          (album) => album.album_id === id
                        )?.quantity;
                        return { album_id: id, quantity: quantity ?? 1 };
                      });
                      setFieldValue("albums", album);
                    }}
                    value={values["albums"].map((album) => album.album_id)}
                    renderInput={(params) => (
                      <TextFieldAutocompleteForm
                        params={params}
                        name="albums"
                        label="Albums"
                        formProps={formProps}
                      />
                    )}
                    disableCloseOnSelect
                  />
                  {values.albums.map((album, index) => {
                    const findOption = find(albumsData, { id: album.album_id });
                    return (
                      <Stack key={index} direction="row" spacing={2}>
                        <Stack
                          component={Paper}
                          variant="outlined"
                          p={1}
                          sx={{ width: "100%" }}
                        >
                          <Typography>Name: {findOption.name}</Typography>
                          <Typography>
                            Description: {findOption.description}
                          </Typography>
                          <Typography>
                            Price: {findOption.product_type.price_format}
                          </Typography>
                        </Stack>
                        <TextFieldForm
                          name={`albums.${index}.quantity`}
                          label="Quantity"
                          formProps={formProps}
                          props={{
                            type: "number",
                            required: true,
                            fullWidth: false,
                          }}
                        />
                        <Box>
                          <IconButton
                            onClick={() => {
                              const newAlbums = values.albums.filter(
                                (album, i) => i !== index
                              );
                              setFieldValue("albums", newAlbums);
                            }}
                          >
                            <CustomIcon icon="delete" />
                          </IconButton>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    setAddEdit(false);
                    resetForm();
                    setPackageId("");
                    setFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  type="submit"
                  onClick={submitForm}
                >
                  OK
                </LoadingButton>
              </DialogActions>
            </Form>
          </OverlayBox>
        );
      }}
    </Formik>
  );
}
