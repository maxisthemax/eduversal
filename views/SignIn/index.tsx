import * as yup from "yup";
import { Form, Formik } from "formik";

//*components
import Layout from "@/components/Layout";
import { TextFieldForm } from "@/components/Form";

//*mui
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { signIn } from "@/lib/auth-client";

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
  return (
    <Layout>
      <Container maxWidth="sm" sx={{ alignContent: "center" }}>
        <Paper elevation={0}>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async ({ email, password }) => {
              await signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
              });
            }}
          >
            {({
              values,
              errors,
              handleChange,
              touched,
              handleBlur,
              handleSubmit,
            }) => {
              const formProps = {
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
              };
              return (
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
                      props={{ required: true }}
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
                  </Stack>
                </Form>
              );
            }}
          </Formik>
        </Paper>
      </Container>
    </Layout>
  );
}
