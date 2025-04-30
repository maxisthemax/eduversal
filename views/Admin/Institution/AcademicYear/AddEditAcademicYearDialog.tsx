import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { getYear, endOfYear, startOfYear } from "date-fns";

//*components
import { OverlayBox } from "@/components/Box";
import { TextFieldForm, DatePickerForm } from "@/components/Form";

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
import { useAcademicYears } from "@/data/admin/institution/academicYear";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  year: yup.number().required("Required"),
  start_date: yup.date().required("Required"),
  end_date: yup.date().required("Required"),
});

function AddEditAcademicYearDialog({
  mode = "add",
  academicYearId,
}: {
  mode?: "add" | "edit";
  academicYearId?: string;
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
          Add Academic Year
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
        <AddEditAcademicYearDialogForm
          mode={mode}
          academicYearId={academicYearId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditAcademicYearDialog;

function AddEditAcademicYearDialogForm({
  academicYearId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  academicYearId?: string;
  handleClose: () => void;
}) {
  const { academicYearData, addAcademicYear, updateAcademicYear } =
    useAcademicYears(academicYearId);

  return (
    <Formik
      initialValues={
        mode === "edit" && academicYearData
          ? {
              name: academicYearData.name,
              year: academicYearData.year,
              start_date: academicYearData.start_date,
              end_date: academicYearData.end_date,
            }
          : {
              name: "",
              year: getYear(new Date()),
              start_date: startOfYear(new Date()),
              end_date: endOfYear(new Date()),
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (mode === "add") {
            await addAcademicYear(values);
          } else {
            await updateAcademicYear(academicYearId, values);
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
                {mode === "edit" ? "Edit Academic Year" : "Add Academic Year"}
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
                    name="year"
                    label="Year"
                    formProps={{
                      ...formProps,
                      handleChange: (e) => {
                        formProps.handleChange(e);
                        setFieldValue(
                          "start_date",
                          startOfYear(new Date("01/01/" + e.target.value))
                        );
                        setFieldValue(
                          "end_date",
                          endOfYear(new Date("01/01/" + e.target.value))
                        );
                      },
                    }}
                    props={{ type: "number", required: true }}
                  />
                  <DatePickerForm
                    mode="start"
                    name="start_date"
                    label="Start Date"
                    formProps={formProps}
                    props={{ required: true }}
                  />
                  <DatePickerForm
                    name="end_date"
                    label="End Date"
                    mode="end"
                    formProps={formProps}
                    props={{ required: true }}
                  />
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
