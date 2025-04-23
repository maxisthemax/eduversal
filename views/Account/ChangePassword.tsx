import * as yup from "yup";
import { Formik, Form } from "formik";

//*components
import { FlexBox, OverlayBox, Page } from "@/components/Box";
import { TextFieldForm } from "@/components/Form";
import Container from "@mui/material/Container";

//*mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

//*data
import { useUser } from "@/data/user";

const validationSchema = yup.object({
  password: yup.string().required("Password is required"),
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /^[a-zA-Z0-9.,!?:;'"()\[\]{}\-_+=\/\\|@#$%^&*~]+$/,
      "Password can only contain letters, numbers, and common punctuation"
    )
    .required("Password is required"),
  confirm_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .required("Password is required")
    .oneOf([yup.ref("new_password")], "Your passwords do not match."),
});

function ChangePassword() {
  const { changePassword } = useUser();

  return (
    <Page
      title="Change Password"
      subtitle="For the security of your account, please do not share your password with anyone"
      backgroundColor="white"
    >
      <Formik
        initialValues={{
          password: "",
          new_password: "",
          confirm_password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (
          { password, new_password, confirm_password },
          { resetForm }
        ) => {
          try {
            await changePassword(password, new_password, confirm_password);
            resetForm();
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({
          values,
          errors,
          handleChange,
          touched,
          handleBlur,
          handleSubmit,
          isSubmitting,
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
              <Form onSubmit={handleSubmit}>
                <Container maxWidth="sm" disableGutters sx={{ ml: 0 }}>
                  <Stack spacing={2} sx={{ pt: 2 }}>
                    <TextFieldForm
                      name="password"
                      label="Password"
                      formProps={formProps}
                      props={{
                        required: true,
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />
                    <TextFieldForm
                      name="new_password"
                      label="New Password"
                      formProps={formProps}
                      props={{
                        required: true,
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />
                    <TextFieldForm
                      name="confirm_password"
                      label="Confirm Password"
                      formProps={formProps}
                      props={{
                        required: true,
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />
                    <Typography variant="body2" color="textDisabled">
                      Password must be 8-16 characters long, contain at least
                      one uppercase and one lowercase character, and include
                      only letters, numbers or common punctuation
                    </Typography>
                    <Stack direction={"row"} spacing={2}>
                      <Button
                        fullWidth={false}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Save Changes
                      </Button>
                      <FlexBox />
                    </Stack>
                  </Stack>
                </Container>
              </Form>
            </OverlayBox>
          );
        }}
      </Formik>
    </Page>
  );
}
export default ChangePassword;
