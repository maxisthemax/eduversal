import * as yup from "yup";
import Link from "next/link";
import { Form, Formik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";

//*components
import { TextFieldForm, CheckboxForm } from "@/components/Form";
import { FlexBox, OverlayBox } from "@/components/Box";
import { useCustomDialog } from "@/components/Dialog";

//*mui
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

//*utils
import axios from "@/utils/axios";

//*validation
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

function SignIn() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { handleOpenDialog, handleCloseDialog } = useCustomDialog();

  return (
    <Container maxWidth="sm" sx={{ alignContent: "center" }}>
      <Paper elevation={0}>
        <Formik
          initialValues={{ email: "", password: "", remember_me: false }}
          validationSchema={validationSchema}
          onSubmit={async ({ email, password, remember_me }) => {
            try {
              await axios.post("auth/signIn", {
                email,
                password,
                remember_me,
                is_admin: true,
              });
              push(redirect ?? "/admin");
            } catch (error) {
              if (error.response.data.type === "USER_NOT_VERIFIED") {
                handleOpenDialog({
                  allowClose: false,
                  allowOutsideClose: false,
                  title: "User Not Verified",
                  description:
                    "Please check your email to verify your account \n If you didn't receive any email, click the button below to resend",
                  content: (
                    <Button
                      onClick={async () => {
                        axios.post("auth/resendVerification", {
                          email,
                          type: "ADMIN",
                        });
                        handleCloseDialog();
                      }}
                    >
                      Resend Email Verification
                    </Button>
                  ),
                  onConfirm: () => {},
                });
              }
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
                  <Stack spacing={3} sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4">
                      <b>Admin Log In</b>
                    </Typography>
                    <TextFieldForm
                      name="email"
                      label="Email"
                      formProps={formProps}
                      props={{ required: true, placeholder: "Your Email" }}
                    />
                    <TextFieldForm
                      name="password"
                      label="Password"
                      formProps={formProps}
                      props={{ required: true, type: "password" }}
                    />
                    <Stack direction="row" sx={{ alignItems: "center", pl: 1 }}>
                      <CheckboxForm
                        name="remember_me"
                        label="Remember Me"
                        formProps={formProps}
                      />
                      <FlexBox />
                      <Typography>
                        <Link href={"/admin/forgotpassword"}>
                          Forgot Password?
                        </Link>
                      </Typography>
                    </Stack>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Log In
                    </Button>
                    <Typography sx={{ textAlign: "center", pt: 4 }}>
                      Don&apos;t have an account?{" "}
                      <Link href={"/admin/signup"}>Sign up</Link>
                    </Typography>
                  </Stack>
                </Form>
              </OverlayBox>
            );
          }}
        </Formik>
      </Paper>
    </Container>
  );
}

export default SignIn;
