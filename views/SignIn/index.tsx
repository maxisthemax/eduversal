import * as yup from "yup";
import Link from "next/link";
import { Form, Formik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";

//*components
import { TextFieldForm } from "@/components/Form";
import { OverlayBox } from "@/components/Box";
import { useCustomDialog } from "@/components/Dialog";

//*mui
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
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
  password: yup
    .string()
    .min(6, "Password is less than 6")
    .required("Password is required"),
});

export default function SignIn() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { handleOpenDialog } = useCustomDialog();

  return (
    <Container maxWidth="sm" sx={{ alignContent: "center" }}>
      <Paper elevation={0}>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async ({ email, password }) => {
            try {
              await axios.post("auth/signIn", { email, password });
              push(redirect ?? "/photos");
            } catch (error) {
              if (error.response.data.type === "USER_NOT_VERIFIED") {
                handleOpenDialog({
                  allowClose: false,
                  allowOutsideClose: false,
                  title: "User Not Verified",
                  description: "Please check your email to verify your account",
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
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Typography variant="h3">
                      <b>Sign In</b>
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button fullWidth variant="contained" color="primary">
                        User
                      </Button>
                      <Button fullWidth variant="contained">
                        Marchants
                      </Button>
                    </Stack>
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
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Remember Me"
                      labelPlacement="end"
                    />
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Sign In
                    </Button>
                    <Typography sx={{ textAlign: "center", pt: 4 }}>
                      Don&apos;t have an account yet?{" "}
                      <Link href={"/signup"}>Sign up</Link>
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
