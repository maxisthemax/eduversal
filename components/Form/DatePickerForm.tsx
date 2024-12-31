/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten } from "flat";
import { FormikErrors, FormikTouched, FormikValues } from "formik";
import { startOfDay, endOfDay } from "date-fns";

//*mui
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";

interface FormProps {
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  values: FormikValues;
  handleChange: (e: any) => void;
}

const generateDatePickerFormProps = (
  name: string,
  formProps: FormProps
): {
  name: string;
  value: Date | null;
  onChange?: (e: any) => void;
  error: boolean;
  helperText: string | undefined;
} => {
  const error = flatten(formProps.errors) as Record<string, any>;
  const touched = flatten(formProps.touched) as Record<string, any>;
  const values = flatten(formProps.values) as Record<string, Date | null>;

  return {
    name: name,
    value: values[name] ? values[name] : null,
    error: Boolean(touched[name]) && Boolean(error[name]) ? true : false,
    helperText: touched[name] ? (error[name] as string) : "",
    onChange: formProps.handleChange,
  };
};

export type MyDatePickerProps = DatePickerProps<Date> & {
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  mode?: "start" | "end";
  required?: boolean;
};

function DatePickerForm({
  formProps,
  label,
  name,
  mode = "start",
  props,
}: {
  formProps: FormProps;
  label: string;
  name: string;
  mode?: "start" | "end";
  props?: MyDatePickerProps;
}) {
  const { error, helperText, onChange } = generateDatePickerFormProps(
    name,
    formProps
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        format="dd/MM/yyyy"
        slotProps={{
          textField: {
            required: props?.required !== undefined ? props.required : false,
            error: error,
            helperText: helperText,
            fullWidth: props?.fullWidth !== undefined ? props.fullWidth : true,
          },
        }}
        {...props}
        {...generateDatePickerFormProps(name, formProps)}
        onChange={(value) => {
          if (onChange) {
            if (mode === "start")
              onChange({
                target: {
                  name: name,
                  value: startOfDay(value),
                },
              });
            else
              onChange({
                target: {
                  name: name,
                  value: endOfDay(value),
                },
              });
          }
        }}
        label={label}
      />
    </LocalizationProvider>
  );
}

export default DatePickerForm;
