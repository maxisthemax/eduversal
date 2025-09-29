import * as yup from "yup";
import { Formik, Form } from "formik";

//*components
import { FlexBox, OverlayBox, Page } from "@/components/Box";
import Container from "@mui/material/Container";
import PasswordTextFieldWithHide from "@/components/PasswordTextFieldWithHide";

//*mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

//*data
import { useUser } from "@/data/user";
import { t } from "@/helpers/useTranslation";

const validationSchema = yup.object({
  password: yup.string().required(t("Password is required")),
  new_password: yup
    .string()
    .min(8, t("Password must be at least 8 characters"))
    .max(16, t("Password must be at most 16 characters"))
    .matches(/[A-Z]/, t("Password must contain at least one uppercase letter"))
    .matches(/[a-z]/, t("Password must contain at least one lowercase letter"))
    .matches(/[0-9]/, t("Password must contain at least one number"))
    .matches(
      /^[a-zA-Z0-9.,!?:;'"()\[\]{}\-_+=\/\\|@#$%^&*~]+$/,
      t("Password can only contain letters, numbers, and common punctuation")
    )
    .required(t("Password is required")),
  confirm_password: yup
    .string()
    .min(8, t("Password must be at least 8 characters"))
    .max(16, t("Password must be at most 16 characters"))
    .required(t("Password is required"))
    .oneOf([yup.ref("new_password")], t("Your passwords do not match.")),
});

function ChangePassword() {
  const { changePassword } = useUser();

  return (
    <Page
      title={t("Change Password")}
      subtitle={t(
        "For the security of your account, please do not share your password with anyone"
      )}
      backgroundColor="white"
      sx={{ height: "calc(100% - 16px)" }}
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
                <Container disableGutters sx={{ ml: 0 }}>
                  <Stack spacing={2} sx={{ pt: 2 }}>
                    <PasswordTextFieldWithHide
                      name="password"
                      label={t("Password")}
                      formProps={formProps}
                      props={{
                        autoComplete: "new-password",
                      }}
                    />
                    <PasswordTextFieldWithHide
                      name="new_password"
                      label={t("New Password")}
                      formProps={formProps}
                      props={{
                        autoComplete: "new-password",
                      }}
                    />
                    <PasswordTextFieldWithHide
                      name="confirm_password"
                      label={t("Confirm Password")}
                      formProps={formProps}
                      props={{
                        autoComplete: "new-password",
                      }}
                    />
                    <Typography variant="body2" color="textDisabled">
                      {t(
                        "Password must be 8-16 characters long, contain at least one uppercase and one lowercase character, and include only letters, numbers or common punctuation"
                      )}
                    </Typography>
                    <Stack direction={"row"} spacing={2}>
                      <FlexBox />
                      <Button
                        fullWidth={false}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        {t("Save Changes")}
                      </Button>
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
