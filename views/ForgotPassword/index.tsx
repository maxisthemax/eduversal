import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

//*components
import { OverlayBox } from "@/components/Box";
import { TextFieldForm } from "@/components/Form";

//*mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import axios from "@/utils/axios";

// Define the Yup validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

function ForgotPassword() {
  return (
    <Container maxWidth="sm" sx={{ alignContent: "center" }}>
      <Paper elevation={0}>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            await axios.post("/auth/forgotPassword", values);
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
                      <b>Forgot Password</b>
                    </Typography>
                    <TextFieldForm
                      name="email"
                      label="Email"
                      formProps={formProps}
                      props={{ required: true }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
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

export default ForgotPassword;
