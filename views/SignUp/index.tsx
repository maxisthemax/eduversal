import * as yup from "yup";
import { Form, Formik } from "formik";
import Link from "next/link";

//*components
import { MobileNumberForm, TextFieldForm } from "@/components/Form";
import StateSelectTextFieldForm from "@/components/Form/StateSelectTextFieldForm";

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
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password is less than 8")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(/[a-zA-Z]/, "Password must contain an alphabet")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .min(8, "Password is less than 6")
    .required("Password is required")
    .oneOf([yup.ref("password")], "Your passwords do not match."),
  phone_no: yup.string().required("Phone No is required"),
  address_1: yup.string().required("Address 1 No is required"),
  postcode: yup.string().required("Postcode is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
});

export default function SignIn() {
  return (
    <Container maxWidth="sm" sx={{ alignContent: "center" }}>
      <Paper elevation={0}>
        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirm_password: "",
            country_code: "+60",
            phone_no: "",
            address_1: "",
            address_2: "",
            postcode: "",
            state: "",
            city: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async ({
            first_name,
            last_name,
            email,
            password,
            country_code,
            phone_no,
            address_1,
            address_2,
            postcode,
            state,
            city,
          }) => {
            await axios.post("auth/signUp", {
              first_name,
              last_name,
              email,
              password,
              country_code,
              phone_no,
              address_1,
              address_2,
              postcode,
              state,
              city,
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
              <Form onSubmit={handleSubmit}>
                <Stack spacing={2} sx={{ p: 2 }}>
                  <Typography variant="h3">
                    <b>Sign Up</b>
                  </Typography>
                  <TextFieldForm
                    name="first_name"
                    label="First Name"
                    formProps={formProps}
                    props={{ required: true }}
                  />
                  <TextFieldForm
                    name="last_name"
                    label="Last Name"
                    formProps={formProps}
                    props={{ required: true }}
                  />
                  <TextFieldForm
                    name="email"
                    label="Email"
                    formProps={formProps}
                    props={{
                      required: true,
                      placeholder: "Your Email",
                    }}
                  />
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
                    name="confirm_password"
                    label="Confirm Password"
                    formProps={formProps}
                    props={{ required: true, type: "password" }}
                  />
                  <MobileNumberForm
                    name="phone_no"
                    label="Phone No"
                    formProps={formProps}
                    props={{ required: true }}
                    countryCallingCode={values.country_code}
                    onCountryChange={(e) => setFieldValue("country_code", e)}
                  />
                  <TextFieldForm
                    name="address_1"
                    label="Address 1"
                    formProps={formProps}
                    props={{ required: true }}
                  />
                  <TextFieldForm
                    name="address_2"
                    label="Address 2"
                    formProps={formProps}
                  />
                  <TextFieldForm
                    name="postcode"
                    label="Postcode"
                    formProps={formProps}
                    onlyNumber={true}
                  />
                  <StateSelectTextFieldForm
                    name="state"
                    label="State"
                    formProps={formProps}
                  />
                  <TextFieldForm
                    name="city"
                    label="City"
                    formProps={formProps}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Register
                  </Button>
                  <Typography>
                    If you already have an account.{" "}
                    <Link href={"/signin"}>Sign In Here</Link>
                  </Typography>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Paper>
    </Container>
  );
}
