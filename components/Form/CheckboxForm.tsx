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
  size = "medium",
  labelPlacement = "end",
}: {
  formProps: FormProps;
  name: string;
  label?: string;
  booleanValue?: { true: string; false: string };
  size?: "small" | "medium" | "large";
  labelPlacement?: "top" | "start" | "bottom" | "end";
}) {
  //*const
  const values = flatten(formProps.values) as Record<string, any>;

  return !label ? (
    <Field name={name}>
      {({ field }) => (
        <Checkbox
          size={size}
          {...field}
          checked={
            booleanValue
              ? findKey(booleanValue, (value) => value === values[name]) ===
                "true"
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
      )}
    </Field>
  ) : (
    <FormControlLabel
      labelPlacement={labelPlacement}
      control={
        <Field name={name}>
          {({ field }) => (
            <FormControlLabel
              labelPlacement={labelPlacement}
              control={
                <Checkbox
                  size={size}
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
