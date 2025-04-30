import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";

//*components
import { OverlayBox } from "@/components/Box";
import { CheckboxForm, TextFieldForm } from "@/components/Form";

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
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useProductType } from "@/data/admin/productType";
import TextFieldPriceForm from "@/components/Form/TextFieldPriceForm";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  type: yup.string().required("Required"),
  currency: yup.string().required("Required"),
  price: yup.number().required("Required"),
});

function AddEditProductTypeDialog({
  mode = "add",
  productTypeId,
}: {
  mode?: "add" | "edit";
  productTypeId?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      {mode === "edit" ? (
        <MenuItem {...bindTrigger(popupState)}>Edit</MenuItem>
      ) : (
        <Button
          size="small"
          variant={"outlined"}
          color="inherit"
          {...bindTrigger(popupState)}
        >
          Add Product Type
        </Button>
      )}
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {
          popupState.close();
        }}
      >
        <AddEditProductTypeDialogForm
          mode={mode}
          productTypeId={productTypeId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditProductTypeDialog;

function AddEditProductTypeDialogForm({
  productTypeId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  productTypeId?: string;
  handleClose: () => void;
}) {
  const { addProductType, updateProductType, productData, status } =
    useProductType(productTypeId);

  if (status === "pending") return <LinearProgress />;

  return (
    <Formik
      initialValues={
        mode === "edit" && productData
          ? {
              name: productData.name,
              type: productData.type,
              currency: productData.currency,
              price: productData.price,
              is_deliverable: productData.is_deliverable,
            }
          : {
              name: "",
              type: "",
              currency: "RM",
              price: 0,
              is_deliverable: true,
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (mode === "add") {
            await addProductType(values);
          } else {
            await updateProductType(productTypeId, values);
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
                {mode === "edit" ? "Edit Product Type" : "Add Product Type"}
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
                    name="type"
                    label="Type"
                    formProps={formProps}
                    props={{ select: true, required: true }}
                  >
                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                    <MenuItem value="GROUP">Group</MenuItem>
                  </TextFieldForm>
                  <Stack spacing={2} direction="row">
                    <TextFieldForm
                      name="currency"
                      label="Currency"
                      formProps={formProps}
                      props={{
                        select: true,
                        required: true,
                        sx: { maxWidth: 100 },
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
                  <Box sx={{ pl: 2 }}>
                    <CheckboxForm
                      name="is_deliverable"
                      label="Is Deliverable"
                      formProps={formProps}
                    />
                    <Typography variant="body2" color="textSecondary">
                      When checked, the product can be delivered.
                    </Typography>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 4 }}>
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
