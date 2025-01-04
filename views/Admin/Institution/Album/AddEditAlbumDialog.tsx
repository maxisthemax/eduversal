import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useParams } from "next/navigation";

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
import { type, useAlbums } from "@/data/admin/institution/album";

//*validation
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  type: yup.string().required("Required"),
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
        onClose={() => {
          popupState.close();
        }}
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
  const academicYearId = params.academicYearId as string;
  const { albumData, addAlbum, updateAlbum } = useAlbums(
    institutionId,
    academicYearId,
    courseId,
    albumId
  );

  return (
    <Formik
      initialValues={
        mode === "edit" && albumData
          ? {
              name: albumData.name,
              description: albumData.description,
              type: albumData.type,
            }
          : {
              name: "",
              description: "",
              type: "INDIVIDUAL",
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
                    name="type"
                    label="Type"
                    formProps={formProps}
                    props={{ select: true, required: true }}
                  >
                    {type.map(({ value, label }) => {
                      return (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      );
                    })}
                  </TextFieldForm>
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
