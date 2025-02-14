/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten } from "flat";
import { FormikErrors, FormikTouched, FormikValues } from "formik";

//*material
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";

interface FormProps {
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  values: FormikValues;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
}

export const generateAutocompleteFormProps = (
  name: string,
  formProps: FormProps
): {
  error: boolean;
  helperText: string | undefined;
  onBlur?: (e: any) => void;
  name: string;
} => {
  const error = flatten(formProps.errors) as Record<string, any>;
  const touch = flatten(formProps.touched) as Record<string, any>;
  return {
    error: Boolean(touch[name]) && Boolean(error[name]) ? true : false,
    helperText: touch[name] ? (error[name] as string) : "",
    onBlur: formProps.handleBlur,
    name: name,
  };
};

function TextFieldAutocompleteForm({
  formProps,
  label,
  name,
  params,
  props,
}: {
  formProps: FormProps;
  label: string;
  name: string;
  params?: AutocompleteRenderInputParams;
  props?: TextFieldProps;
}) {
  return (
    <TextField
      {...params}
      label={label}
      {...generateAutocompleteFormProps(name, formProps)}
      {...props}
      helperText={
        generateAutocompleteFormProps(name, formProps).helperText as string
      }
    />
  );
}

export default TextFieldAutocompleteForm;
