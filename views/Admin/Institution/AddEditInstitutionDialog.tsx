import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";

//*components
import { OverlayBox } from "@/components/Box";
import { TextFieldForm } from "@/components/Form";

//*material
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useInstitutions } from "@/data/institutions/institutions";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  type_id: yup.string().required("Required"),
  code: yup.string().required("Required"),
});

function AddEditInstitutionDialog({
  mode = "add",
  institutionId,
}: {
  mode?: "add" | "edit";
  institutionId?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      <Button
        variant={mode === "edit" ? "outlined" : "contained"}
        {...bindTrigger(popupState)}
      >
        {mode === "edit" ? "Edit" : "Add Institution"}
      </Button>
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
        <AddEditInstitutionDialogForm
          mode={mode}
          institutionId={institutionId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditInstitutionDialog;

function AddEditInstitutionDialogForm({
  institutionId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  institutionId?: string;
  handleClose: () => void;
}) {
  const { addInstitution, updateInstitution, institutionData } =
    useInstitutions(institutionId);

  return (
    <Formik
      initialValues={
        mode === "edit" && institutionData
          ? {
              name: institutionData.name,
              type_id: institutionData.type_id,
              code: institutionData.code,
            }
          : {
              name: "",
              type_id: "",
              code: "",
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (mode === "add") {
            await addInstitution({
              name: values.name,
              type_id: values.type_id,
              code: values.code,
            });
          } else {
            await updateInstitution(institutionId, values);
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
        isValid,
        submitForm,
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
                {mode === "edit" ? "Edit Institution" : "Add Institution"}
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
                  />
                  <TextFieldForm
                    name="type_id"
                    label="Type"
                    formProps={formProps}
                    props={{ select: true }}
                  >
                    <MenuItem value="cm5an3v0w00027k8cz2bm8ta4">
                      Preschool
                    </MenuItem>
                    <MenuItem value="cm5an3v1p00037k8cxq9ekwr8">
                      Primary School
                    </MenuItem>
                  </TextFieldForm>
                  <TextFieldForm
                    name="code"
                    label="Code"
                    formProps={formProps}
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
                  disabled={!isValid || isSubmitting}
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
