import * as yup from "yup";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";

//*lodash
import orderBy from "lodash/orderBy";
import find from "lodash/find";

//*components
import PasswordTextFieldWithHide from "@/components/PasswordTextFieldWithHide";
import { useCustomDialog } from "@/components/Dialog";
import {
  MobileNumberForm,
  TextFieldForm,
  StateSelectTextFieldForm,
  TextFieldAutocompleteForm,
} from "@/components/Form";
import { OverlayBox } from "@/components/Box";

//*mui
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

//*data
import { useInstitutions } from "@/data/public/institution";

//*utils
import axios from "@/utils/axios";

//*validation
const validationSchema = yup.object({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required")
    .test("forbidden-email", "This email is not allowed", (value) => {
      if (!value) return true;
      const forbiddenWords = ["admin", "administrator", "root", "support"];
      return !forbiddenWords.some((word) => value.toLowerCase().includes(word));
    }),
  password: yup
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
    .oneOf([yup.ref("password")], "Your passwords do not match."),
  phone_no: yup
    .string()
    .required("Phone No is required")
    .test("forbidden-phone", "Phone No cannot start with 0", (value) => {
      if (!value) return true;
      return !value.startsWith("0");
    }),
  address_1: yup.string().required("Address 1 No is required"),
  postcode: yup.string().required("Postcode is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  institutions: yup.array().min(1, "School / Institution is required"),
});

function SignUp() {
  const { push } = useRouter();
  const { handleOpenDialog } = useCustomDialog();
  const { institutionsData, status } = useInstitutions();
  if (status === "loading") return <LinearProgress />;

  return (
    <Box
      sx={{
        alignContent: "center",
        height: "100vh",
        width: "100%",
        position: { xs: "relative", sm: "relative", md: "inherit" },
        top: { xs: 260, sm: 260, md: 0 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          alignContent: "center",
        }}
      >
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
              institutions: [],
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
              institutions,
            }) => {
              await axios.post(
                "auth/signUp",
                {
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
                  institutions,
                },
                undefined,
                true
              );

              handleOpenDialog({
                allowOutsideClose: false,
                allowClose: false,
                title: "Registration Successful",
                description:
                  "You have successfully registered. Check your email to verify your account.",
                onConfirm: () => {
                  push("/signin");
                },
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
                        <b>Sign Up</b>
                      </Typography>
                      <Typography variant="body1" sx={{ pl: 5, pr: 5 }}>
                        {
                          "Join us to unlock your child's class albums, cherish their moments, and share the joy."
                        }
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "column", md: "row" }}
                        spacing={2}
                      >
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
                      </Stack>
                      <TextFieldForm
                        name="email"
                        label="Email"
                        formProps={formProps}
                        props={{
                          required: true,
                          placeholder: "Your Email",
                        }}
                      />
                      <PasswordTextFieldWithHide
                        name="password"
                        label="Password"
                        formProps={formProps}
                        props={{
                          autoComplete: "new-password",
                        }}
                      />
                      <PasswordTextFieldWithHide
                        name="confirm_password"
                        label="Confirm Password"
                        formProps={formProps}
                      />
                      <MobileNumberForm
                        name="phone_no"
                        label="Phone No"
                        formProps={formProps}
                        props={{ required: true }}
                        countryCallingCode={values.country_code}
                        onCountryChange={(e) =>
                          setFieldValue("country_code", e)
                        }
                      />
                      <Autocomplete
                        fullWidth
                        multiple
                        options={orderBy(
                          institutionsData,
                          ["name"],
                          ["asc"]
                        ).map(({ id }) => id)}
                        getOptionLabel={(id) => {
                          const findOption = find(institutionsData, { id });
                          return findOption?.name;
                        }}
                        onChange={(e, value) => {
                          setFieldValue("institutions", value);
                        }}
                        value={values["institutions"]}
                        renderInput={(params) => (
                          <TextFieldAutocompleteForm
                            params={params}
                            name="institutions"
                            label="School / Institution"
                            formProps={formProps}
                          />
                        )}
                        disableCloseOnSelect
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
                      <Stack direction={"row"} spacing={2}>
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
                      </Stack>
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
                </OverlayBox>
              );
            }}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
}
export default SignUp;
