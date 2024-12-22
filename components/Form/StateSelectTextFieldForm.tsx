/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormikErrors, FormikTouched, FormikValues } from "formik";

//*components
import TextFieldForm from "./TextFieldForm";

//*mui
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";

interface FormProps {
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  values: FormikValues;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
}

function StateSelectTextFieldForm({
  formProps,
  label,
  name,
}: {
  formProps: FormProps;
  label: string;
  name: string;
}) {
  const stateDate = {
    Malaysia: [
      "Johor",
      "Kedah",
      "Kelantan",
      "Melaka",
      "Negeri Sembilan",
      "Pahang",
      "Penang",
      "Perak",
      "Perlis",
      "Sabah",
      "Sarawak",
      "Selangor",
      "Terengganu",
      "Kuala Lumpur",
      "Labuan",
      "Putrajaya",
    ],
  };

  return (
    <TextFieldForm
      label={label}
      name={name}
      formProps={formProps}
      props={{ select: true }}
    >
      {stateDate["Malaysia"].map((key) => {
        return (
          <MenuItem value={key} key={key}>
            <Stack
              spacing={1}
              direction="row"
              sx={{ width: "100%", alignItems: "center" }}
            >
              <ListItemText>{key}</ListItemText>
            </Stack>
          </MenuItem>
        );
      })}
    </TextFieldForm>
  );
}

export default StateSelectTextFieldForm;
