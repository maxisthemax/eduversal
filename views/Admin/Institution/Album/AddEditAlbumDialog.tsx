import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";

//*lodash
import find from "lodash/find";

//*components
import { OverlayBox } from "@/components/Box";
import { TextFieldAutocompleteForm, TextFieldForm } from "@/components/Form";

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

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useAlbums } from "@/data/admin/institution/album";
import { useProductType } from "@/data/admin/productType";
import { useProductVariation } from "@/data/admin/productVariation";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
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
        maxWidth="sm"
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
  const { albumData, addAlbum, updateAlbum } = useAlbums(albumId);
  const { productsData, status } = useProductType();
  const { productVariationsData, status: productVariationsDataStatus } =
    useProductVariation();

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
            }
          : {
              name: "",
              description: "",
              product_type_id: productsData[0]?.id ?? "",
              product_variations_id: [],
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
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
                    props={{ required: true }}
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
