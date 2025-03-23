import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useParams } from "next/navigation";

//*lodash
import find from "lodash/find";

//*components
import { CustomIcon } from "@/components/Icons";
import { FlexBox, OverlayBox } from "@/components/Box";
import {
  CheckboxForm,
  TextFieldAutocompleteForm,
  TextFieldForm,
} from "@/components/Form";
import useUpload from "@/components/useUpload";

//*material
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { useProductType } from "@/data/admin/productType";
import { useProductVariation } from "@/data/admin/productVariation";
import { Select } from "@mui/material";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  product_type_id: yup.string().required("Required"),
});

function AddEditAlbumDialog({
  mode = "add",
  albumId,
}: {
  mode?: "add" | "edit";
  albumId?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      <Button
        variant={mode === "edit" ? "outlined" : "contained"}
        {...bindTrigger(popupState)}
      >
        {mode === "edit" ? "Edit" : "Add Album"}
      </Button>
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="md"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {}}
      >
        <AddEditAlbumDialogForm
          mode={mode}
          albumId={albumId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditAlbumDialog;

function AddEditAlbumDialogForm({
  albumId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  albumId?: string;
  handleClose: () => void;
}) {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;
  const { albumData, addAlbum, updateAlbum } = useAlbums(albumId);
  const { productsData, status } = useProductType();
  const { productVariationsData, status: productVariationsDataStatus } =
    useProductVariation();
  const { files, setFiles, getRootProps, getInputProps, handleUpload } =
    useUpload(
      `institution/${institutionId}/course/${courseId}/album/${albumId}`,
      {
        multiple: false,
      }
    );

  if (status === "pending" || productVariationsDataStatus === "pending")
    return <LinearProgress />;

  return (
    <Formik
      initialValues={
        mode === "edit" && albumData
          ? {
              name: albumData.name,
              description: albumData.description,
              product_type_id: albumData.product_type_id,
              product_variations_id: albumData.product_variations_id,
              album_product_variations: albumData.albumProductVariations.map(
                ({
                  productVariation_id,
                  album_id,
                  disabled_options,
                  mandatory,
                }) => {
                  return {
                    productVariation_id,
                    disabled_options,
                    mandatory,
                    album_id,
                  };
                }
              ),
              preview_url: albumData.preview_url,
              preview_url_key: albumData.preview_url_key,
            }
          : {
              name: "",
              description: "",
              product_type_id: productsData[0]?.id ?? "",
              product_variations_id: [],
              album_product_variations: [],
              preview_url: "",
              preview_url_key: "",
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        console.log("🚀 ~ onSubmit={ ~ values:", values);
        if (files.length === 1) {
          const res = await handleUpload();
          values.preview_url = res[0].display_url;
          values.preview_url_key = res[0].download_url;
        }
        try {
          if (mode === "add") {
            await addAlbum(values);
          } else {
            await updateAlbum(albumId, values);
          }
          handleClose();
          resetForm();
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
              <DialogTitle>
                {mode === "edit" ? "Edit Album" : "Add Album"}
              </DialogTitle>
              <DialogContent>
                <Stack
                  p={1}
                  direction="column"
                  spacing={2}
                  sx={{ maxHeight: getFullHeightSize(25), overflow: "auto" }}
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
                    props={{ multiline: true, minRows: 3 }}
                  />
                  <TextFieldForm
                    name="product_type_id"
                    label="Product Type"
                    formProps={formProps}
                    props={{ select: true, required: true }}
                  >
                    {productsData.map(({ id, name }) => {
                      return (
                        <MenuItem key={id} value={id}>
                          {name}
                        </MenuItem>
                      );
                    })}
                  </TextFieldForm>
                  {(files.length > 0 || albumData?.preview_url) && (
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
                            : albumData?.preview_url
                        }
                        alt={files[0]?.name ?? albumData?.preview_url}
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
                  <Autocomplete
                    fullWidth
                    multiple
                    options={productVariationsData.map(({ id }) => id)}
                    getOptionLabel={(id) => {
                      const findOption = find(productVariationsData, { id });
                      return findOption?.name;
                    }}
                    onChange={(e, value) => {
                      setFieldValue("product_variations_id", value);

                      setFieldValue(
                        "album_product_variations",
                        value.map((id) => {
                          const findOption = find(
                            values.album_product_variations,
                            { productVariation_id: id }
                          );
                          return (
                            findOption ?? {
                              productVariation_id: id,
                              mandatory: false,
                              options: [],
                            }
                          );
                        })
                      );
                    }}
                    renderOption={(props, option, state, ownerState) => {
                      const { key, ...optionProps } = props;
                      const findOption = find(productVariationsData, {
                        id: option,
                      });
                      return (
                        <Box
                          key={key}
                          component="li"
                          {...optionProps}
                          sx={{ mt: 1 }}
                        >
                          <Stack direction="column" spacing={1}>
                            {ownerState.getOptionLabel(option)}
                            <Table
                              size="small"
                              component={Paper}
                              variant="outlined"
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Description</TableCell>
                                  <TableCell width={100}>Price</TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {findOption.options.map(
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
                          </Stack>
                        </Box>
                      );
                    }}
                    value={values["product_variations_id"]}
                    renderInput={(params) => (
                      <TextFieldAutocompleteForm
                        params={params}
                        name="product_variations_id"
                        label="Product Variations"
                        formProps={formProps}
                      />
                    )}
                    disableCloseOnSelect
                  />
                  {values.album_product_variations.map(
                    ({ productVariation_id }, index) => {
                      return (
                        <Stack
                          key={productVariation_id}
                          component={Paper}
                          sx={{ px: 2, py: 1 }}
                          variant="outlined"
                          spacing={1}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center" }}
                          >
                            <Typography>
                              {
                                find(productVariationsData, {
                                  id: productVariation_id,
                                })?.name
                              }
                            </Typography>
                            <FlexBox />
                            <CheckboxForm
                              name={`album_product_variations.${index}.mandatory`}
                              label="Manadatory"
                              formProps={formProps}
                            />
                            <FormControl sx={{ width: 300 }}>
                              <InputLabel size="small">
                                Options Hide From User
                              </InputLabel>
                              <Select
                                input={
                                  <OutlinedInput label="Options Hide From User" />
                                }
                                multiple
                                value={
                                  values.album_product_variations[index]
                                    .disabled_options ?? []
                                }
                                onChange={(e) => {
                                  const {
                                    target: { value },
                                  } = e;
                                  setFieldValue(
                                    `album_product_variations.${index}.disabled_options`,
                                    typeof value === "string"
                                      ? value.split(",")
                                      : value
                                  );
                                }}
                              >
                                {find(productVariationsData, {
                                  id: productVariation_id,
                                })?.options.map(({ id, name }) => {
                                  return (
                                    <MenuItem key={id} value={id}>
                                      {name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </Stack>
                        </Stack>
                      );
                    }
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    handleClose();
                    resetForm();
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
