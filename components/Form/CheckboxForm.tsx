/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten } from "flat";
import { Field, FormikErrors, FormikTouched, FormikValues } from "formik";

//*lodash
import findKey from "lodash/findKey";

//*mui
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

interface FormProps {
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  values: FormikValues;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
}

function CheckboxForm({
  formProps,
  name,
  label,
  booleanValue,
}: {
  formProps: FormProps;
  name: string;
  label: string;
  booleanValue?: { true: string; false: string };
}) {
  //*const
  const values = flatten(formProps.values) as Record<string, any>;

  return (
    <FormControlLabel
      control={
        <Field name={name}>
          {({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={
                    booleanValue
                      ? findKey(
                          booleanValue,
                          (value) => value === values[name]
                        ) === "true"
                        ? true
                        : false
                      : values[name]
                  }
                  onChange={(event) => {
                    if (booleanValue)
                      formProps.handleChange({
                        target: {
                          name: name,
                          value: booleanValue[event.target.checked.toString()],
                        },
                      });
                    else
                      formProps.handleChange({
                        target: {
                          name: name,
                          value: event.target.checked,
                        },
                      });
                  }}
                />
              }
              label={label}
            />
          )}
        </Field>
      }
      label=""
    />
  );
}

export default CheckboxForm;
