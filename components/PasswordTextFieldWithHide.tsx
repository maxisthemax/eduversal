/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputAdornment, IconButton } from "@mui/material";
import { useState } from "react";
import { TextFieldForm } from "./Form";
import { CustomIcon } from "./Icons";

function PasswordTextFieldWithHide({
  name,
  label,
  formProps,
  props,
}: {
  name: string;
  label: string;
  formProps: any;
  props?: any;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextFieldForm
      name={name}
      label={label}
      formProps={formProps}
      props={{
        slotProps: {
          input: {
            required: true,
            type: showPassword ? "text" : "password",
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleToggleShowPassword}>
                  {showPassword ? (
                    <CustomIcon icon="visibility_off" />
                  ) : (
                    <CustomIcon icon="visibility" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        },
        ...props,
      }}
    />
  );
}

export default PasswordTextFieldWithHide;
