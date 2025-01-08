import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useParams } from "next/navigation";
import { addMonths, addYears } from "date-fns";
import { v4 as uuidv4 } from "uuid";

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
import { useStandard } from "@/data/admin/setting/standard";
import {
  useCourses,
  validPeriodOptions,
} from "@/data/admin/institution/course";
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  access_code: yup.string().required("Required"),
  start_date: yup.date().required("Required"),
  end_date: yup.date().required("Required"),
  standard_id: yup.string().required("Required"),
  valid_period: yup.string().required("Required"),
});

function AddEditCourseDialog({
  mode = "add",
  courseId,
}: {
  mode?: "add" | "edit";
  courseId?: string;
}) {
  //*define
  const popupState = usePopupState({ variant: "dialog" });

  return (
    <>
      {mode === "edit" ? (
        <MenuItem {...bindTrigger(popupState)}>Edit</MenuItem>
      ) : (
        <Button variant={"contained"} {...bindTrigger(popupState)}>
          Add Course
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
        <AddEditCourseDialogForm
          mode={mode}
          courseId={courseId}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default AddEditCourseDialog;

function AddEditCourseDialogForm({
  courseId,
  mode = "add",
  handleClose,
}: {
  mode: "add" | "edit";
  courseId?: string;
  handleClose: () => void;
}) {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const academicYearId = params.academicYearId as string;
  const { institutionData } = useInstitutions(institutionId);
  const { academicYearData } = useAcademicYears(academicYearId);
  const { courseData, addCourse, updateCourse } = useCourses(courseId);
  const { standardsData } = useStandard();

  return (
    <Formik
      initialValues={
        mode === "edit" && courseData
          ? {
              name: courseData.name,
              access_code: courseData.access_code,
              start_date: courseData.start_date,
              end_date: courseData.end_date,
              standard_id: courseData.standard_id,
              valid_period: courseData.valid_period,
            }
          : {
              name: "",
              access_code:
                institutionData.code +
                academicYearData.year.toString() +
                uuidv4().slice(0, 4).toUpperCase(),
              standard_id: "",
              valid_period: "YEAR",
              start_date: new Date(),
              end_date: addYears(new Date(), 1),
            }
      }
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (mode === "add") {
            await addCourse(values);
          } else {
            await updateCourse(courseId, values);
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
                {mode === "edit" ? "Edit Course" : "Add Course"}
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
                    name="standard_id"
                    label="Standard"
                    formProps={formProps}
                    props={{ select: true, required: true }}
                  >
                    {standardsData.map(({ id, name }) => {
                      return (
                        <MenuItem key={id} value={id}>
                          {name}
                        </MenuItem>
                      );
                    })}
                  </TextFieldForm>
                  <TextFieldForm
                    name="access_code"
                    label="Access Code"
                    formProps={formProps}
                    props={{ required: true, disabled: true }}
                  />
                  <TextFieldForm
                    name="valid_period"
                    label="Valid Period"
                    formProps={{
                      ...formProps,
                      handleChange: (e) => {
                        handleChange(e);
                        if (e.target.value !== "CUSTOM") {
                          setFieldValue(
                            "end_date",
                            addMonths(
                              values.start_date,
                              { MONTH: 1, QUARTER: 3, HALF: 6, YEAR: 12 }[
                                e.target.value
                              ]
                            )
                          );
                        }
                      },
                    }}
                    props={{ select: true, required: true }}
                  >
                    {validPeriodOptions.map(({ value, label }) => {
                      return (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      );
                    })}
                  </TextFieldForm>
                  <DatePickerForm
                    mode="start"
                    name="start_date"
                    label="Start Date"
                    formProps={formProps}
                    props={{
                      required: true,
                    }}
                  />
                  <DatePickerForm
                    name="end_date"
                    label="End Date"
                    mode="end"
                    formProps={formProps}
                    props={{
                      required: true,
                      disabled: values.valid_period !== "CUSTOM",
                    }}
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
