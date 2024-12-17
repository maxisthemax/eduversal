/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten } from "flat";
import { FormikErrors, FormikTouched, FormikValues } from "formik";

//*mui
import TextField, { TextFieldProps } from "@mui/material/TextField";

interface FormProps {
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  values: FormikValues;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
}

const generateTextFieldFormProps = (
  name: string,
  formProps: FormProps
): {
  name: string;
  value: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  error: boolean;
  helperText: string | undefined;
} => {
  const error = flatten(formProps.errors) as Record<string, any>;
  const touched = flatten(formProps.touched) as Record<string, any>;
  const values = flatten(formProps.values) as Record<string, any>;

  return {
    name: name,
    value: values[name],
    onChange: formProps.handleChange,
    onBlur: formProps.handleBlur,
    error: Boolean(touched[name]) && Boolean(error[name]) ? true : false,
    helperText: touched[name] ? (error[name] as string) : "",
  };
};

function TextFieldForm({
  formProps,
  type = "string",
  label,
  name,
  props,
  children,
}: {
  formProps: FormProps;
  type?: string;
  label: string;
  name: string;
  props?: TextFieldProps;
  children?: React.ReactNode;
}) {
  return (
    <TextField
      label={label}
      type={type}
      {...generateTextFieldFormProps(name, formProps)}
      {...props}
    >
      {children}
    </TextField>
  );
}

export default TextFieldForm;
