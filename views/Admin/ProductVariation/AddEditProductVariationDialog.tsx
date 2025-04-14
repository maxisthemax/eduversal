import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

//*components
import { CustomIcon } from "@/components/Icons";
import { FlexBox, OverlayBox } from "@/components/Box";
import {
  TextFieldForm,
  TextFieldPriceForm,
  CheckboxForm,
} from "@/components/Form";

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
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

//*data
import {
  ProductVariationOptionCreate,
  useProductVariation,
} from "@/data/admin/productVariation";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  options: yup
    .array()
    .min(1, "Required")
    .of(
      yup.object().shape({
        name: yup.string().required("Required"),
        currency: yup.string().required("Required"),
        price: yup.string().required("Required"),
      })
    ),
});

function AddEditProductVariationDialog({
  mode = "add",
  productVariationId,
}: {
  mode?: "add" | "edit";
  productVariationId?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      {mode === "edit" ? (
        <MenuItem {...bindTrigger(popupState)}>Edit</MenuItem>
      ) : (
        <Button variant={"contained"} {...bindTrigger(popupState)}>
          Add Product Variation
        </Button>
      )}
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="lg"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {
          popupState.close();
        }}
      >
        <AddEditProductVariationDialogForm
          mode={mode}
          productVariationId={productVariationId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditProductVariationDialog;

function AddEditProductVariationDialogForm({
  productVariationId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  productVariationId?: string;
  handleClose: () => void;
}) {
  const {
    addProductVariation,
    productVariationData,
    updateProductVariation,
    status,
  } = useProductVariation(productVariationId);

  if (status === "pending") return <LinearProgress />;
  return (
    <Formik
      initialValues={
        mode === "edit" && productVariationData
          ? {
              name: productVariationData.name,
              description: productVariationData.description,
              is_downloadable: productVariationData.is_downloadable,
              options: productVariationData.options.map((option) => {
                return {
                  id: option.id,
                  name: option.name,
                  description: option.description,
                  currency: option.currency,
                  price: option.price,
                  preview_image: undefined,
                  preview_url: option.preview_url,
                  preview_url_key: option.preview_url_key,
                };
              }),
            }
          : {
              name: "",
              description: "",
              is_downloadable: true,
              options: [
                {
                  name: "",
                  description: "",
                  currency: "RM",
                  price: 0,
                  preview_image: undefined,
                  preview_url: undefined,
                },
              ],
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (mode === "add") {
            await addProductVariation(values);
          } else {
            await updateProductVariation(productVariationId, values);
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
                {mode === "edit"
                  ? "Edit Product Variation"
                  : "Add Product Variation"}
              </DialogTitle>
              <DialogContent>
                <Stack
                  p={1}
                  direction="column"
                  spacing={2}
                  sx={{ overflow: "auto" }}
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
                  />
                  <CheckboxForm
                    name="is_downloadable"
                    label="Is Downloadable"
                    formProps={formProps}
                  />
                  <Grid container spacing={2} alignItems={"start"}>
                    <Grid size={{ xs: 12 }}>
                      <Typography>Options</Typography>
                    </Grid>
                    <FieldArray name="options">
                      {({
                        remove,
                        push,
                      }: {
                        remove: (index: number) => void;
                        push: (item: ProductVariationOptionCreate) => void;
                      }) => {
                        return (
                          <>
                            {values.options.length > 0 &&
                              values.options.map(
                                (
                                  option: ProductVariationOptionCreate,
                                  index: number
                                ) => {
                                  if (option.status === "deleted") return null;
                                  return (
                                    <>
                                      <Grid size={{ xs: 3.5 }}>
                                        <TextFieldForm
                                          name={`options.${index}.name`}
                                          label="Name"
                                          formProps={formProps}
                                          props={{ required: true }}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 4.5 }}>
                                        <TextFieldForm
                                          name={`options.${index}.description`}
                                          label="Desciption"
                                          formProps={formProps}
                                          props={{
                                            multiline: true,
                                            minRows: 3,
                                          }}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 1 }}>
                                        <TextFieldForm
                                          name={`options.${index}.currency`}
                                          label="Currency"
                                          formProps={formProps}
                                          props={{
                                            select: true,
                                            required: true,
                                          }}
                                        >
                                          <MenuItem value="RM">RM</MenuItem>
                                        </TextFieldForm>
                                      </Grid>
                                      <Grid size={{ xs: 2 }}>
                                        <TextFieldPriceForm
                                          name={`options.${index}.price`}
                                          label="Price"
                                          formProps={formProps}
                                          props={{
                                            required: true,
                                          }}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 1 }}>
                                        {values.options.length > 1 && (
                                          <Button
                                            variant="contained"
                                            onClick={() =>
                                              option?.id
                                                ? setFieldValue(
                                                    `options.${index}.status`,
                                                    "deleted"
                                                  )
                                                : remove(index)
                                            }
                                          >
                                            Delete
                                          </Button>
                                        )}
                                      </Grid>

                                      <Grid size={{ xs: 12 }}>
                                        <Stack spacing={2} direction="row">
                                          {values.options[index]
                                            .preview_url && (
                                            <Box
                                              component="img"
                                              src={
                                                values.options[index]
                                                  .preview_url
                                              }
                                              alt={
                                                values.options[index]
                                                  .preview_url
                                              }
                                              sx={{
                                                display: "block",
                                                width: "25%",
                                                objectFit: "cover",
                                              }}
                                            />
                                          )}
                                          {values.options[index]
                                            .preview_image ? (
                                            <Grid size={{ xs: 1 }}>
                                              <IconButton
                                                onClick={() => {
                                                  setFieldValue(
                                                    `options.${index}.preview_url`,
                                                    productVariationData
                                                      ?.options[index]
                                                      ?.preview_url ?? undefined
                                                  );

                                                  setFieldValue(
                                                    `options.${index}.preview_image`,
                                                    undefined
                                                  );
                                                }}
                                              >
                                                <CustomIcon icon="delete" />
                                              </IconButton>
                                            </Grid>
                                          ) : (
                                            <UploadGrid
                                              setFieldValue={setFieldValue}
                                              index={index}
                                            />
                                          )}
                                        </Stack>
                                      </Grid>
                                      <Grid size={{ xs: 12 }}>
                                        <Divider />
                                      </Grid>
                                    </>
                                  );
                                }
                              )}
                            <Grid
                              size={{ xs: 12 }}
                              sx={{
                                justifyItems: "end",
                              }}
                            >
                              <FlexBox />
                              <Button
                                variant="contained"
                                onClick={() =>
                                  push({
                                    name: "",
                                    description: "",
                                    currency: "RM",
                                    price: 0,
                                    status: "new",
                                  })
                                }
                              >
                                Add Item
                              </Button>
                            </Grid>
                          </>
                        );
                      }}
                    </FieldArray>
                  </Grid>
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

function UploadGrid({
  setFieldValue,
  index,
}: {
  setFieldValue: (
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    shouldValidate?: boolean
  ) => void;
  index: number;
}) {
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (files) => {
      setFieldValue(`options.${index}.preview_image`, files[0]);
      setFieldValue(
        `options.${index}.preview_url`,
        URL.createObjectURL(files[0])
      );
    },
    multiple: false,
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
      if (file.size > 30 * 1024 * 1024) {
        return {
          code: "size-too-large",
          message: `file is larger than 30MB`,
        };
      }
      return null;
    },
  });

  return (
    <Grid size={{ xs: 1 }} {...getRootProps()}>
      <input {...getInputProps()} />
      <IconButton>
        <CustomIcon icon="upload" />
      </IconButton>
    </Grid>
  );
}
