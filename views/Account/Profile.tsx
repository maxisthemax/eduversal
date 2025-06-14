import * as yup from "yup";
import { Formik, Form } from "formik";

//*components
import { FlexBox, OverlayBox, Page } from "@/components/Box";
import {
  MobileNumberForm,
  StateSelectTextFieldForm,
  TextFieldForm,
} from "@/components/Form";

//*mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";

//*data
import { useUser } from "@/data/user";

const validationSchema = yup.object({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  phone_no: yup.string().required("Phone No is required"),
  address_1: yup.string().required("Address 1 No is required"),
  postcode: yup.string().required("Postcode is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
});

function Profile() {
  const { data, updateUserData, status } = useUser();

  if (status === "pending") return <LinearProgress />;

  return (
    <Page
      title="Profile"
      subtitle="Manage and protect your account"
      backgroundColor="white"
    >
      <Formik
        initialValues={{
          first_name: data.first_name,
          last_name: data.last_name,
          country_code: data.country_code,
          phone_no: data.phone_no,
          address_1: data.address_1,
          address_2: data.address_2,
          postcode: data.postcode,
          state: data.state,
          city: data.city,
        }}
        validationSchema={validationSchema}
        onSubmit={async ({
          first_name,
          last_name,
          country_code,
          phone_no,
          address_1,
          address_2,
          postcode,
          state,
          city,
        }) => {
          await updateUserData({
            first_name,
            last_name,
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
                  <Stack spacing={2} sx={{ textAlign: "center", pt: 2 }}>
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
                        props={{
                          required: true,
                        }}
                      />
                    </Stack>
                    <TextFieldForm
                      name="last_name"
                      label="Last Name"
                      formProps={formProps}
                      props={{
                        required: true,
                        sx: { display: { xs: "none", sm: "none" } },
                      }}
                    />
                    <TextField
                      value={data.email}
                      disabled={true}
                      label="Email"
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

                    <Stack
                      direction={{ xs: "column", sm: "column", md: "row" }}
                      spacing={2}
                    >
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
                    </Stack>
                    <Stack direction={"row"} spacing={2}>
                      <FlexBox />
                      <Button
                        fullWidth={false}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Save Changes
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
export default Profile;
