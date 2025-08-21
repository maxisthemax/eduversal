import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";

//*components
import { OverlayBox } from "@/components/Box";
import PasswordTextFieldWithHide from "@/components/PasswordTextFieldWithHide";

//*mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

//*utils
import axios from "@/utils/axios";

const validationSchema = yup.object().shape({
  new_password: yup
    .string()
    .min(8, "Password is less than 8")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(/[a-zA-Z]/, "Password must contain an alphabet")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .required("Password is required"),
  confirm_new_password: yup
    .string()
    .min(8, "Password is less than 8")
    .required("Password is required")
    .oneOf([yup.ref("new_password")], "Your passwords do not match."),
});

function ResetPassword() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  return (
    <Container
      maxWidth="sm"
      sx={{ alignContent: "center", textAlign: "center" }}
    >
      <Paper elevation={0}>
        {!email || !token ? (
          <Typography variant="h6">Invalid Link.</Typography>
        ) : (
          <Formik
            initialValues={{ new_password: "", confirm_new_password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await axios.post("/auth/resetPassword", {
                token,
                email,
                new_password: values.new_password,
                type: "ADMIN",
              });
              push("/admin/signin");
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
                    <Stack spacing={2} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4">
                        <b>Reset Password</b>
                      </Typography>
                      <TextField
                        name="email"
                        label="Email"
                        value={email}
                        disabled={true}
                      />
                      <PasswordTextFieldWithHide
                        name="new_password"
                        label="New Password"
                        formProps={formProps}
                        props={{
                          autoComplete: "new-password",
                        }}
                      />
                      <PasswordTextFieldWithHide
                        name="confirm_new_password"
                        label="Confirm Password"
                        formProps={formProps}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Submit
                      </Button>
                      <Button onClick={() => push("/admin/signin")}>
                        Back
                      </Button>
                    </Stack>
                  </Form>
                </OverlayBox>
              );
            }}
          </Formik>
        )}
      </Paper>
    </Container>
  );
}

export default ResetPassword;
