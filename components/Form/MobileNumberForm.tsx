/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { flatten } from "flat";
import { FormikErrors, FormikTouched, FormikValues } from "formik";
import { getData } from "country-list";
import { CountryProperty, findOne } from "country-codes-list";
import { Virtuoso } from "react-virtuoso";
import {
  bindPopover,
  bindTrigger,
  PopupState,
  usePopupState,
} from "material-ui-popup-state/hooks";

//*lodash
import filter from "lodash/filter";
import startsWith from "lodash/startsWith";
import findIndex from "lodash/findIndex";
import includes from "lodash/includes";
import uniqBy from "lodash/uniqBy";

//*components
import { CustomIcon } from "../Icons";

//*material
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Popover from "@mui/material/Popover";
import ListItemText from "@mui/material/ListItemText";

//*helpers
import { replaceStringAll } from "@/helpers/stringHelpers";

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

function MobileNumberForm({
  formProps,
  name,
  label,
  props,
  countryCallingCode = "+60",
  onCountryChange,
  disabledCode = false,
}: {
  formProps: FormProps;
  name: string;
  label: string;
  props?: TextFieldProps;
  countryCallingCode?: string;
  onCountryChange?: (e: string) => void;
  disabledCode?: boolean;
}) {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "customCountryDialog",
  });
  const handleKeyDown = (event) => {
    // Allow only backspace, delete, arrow keys, and numeric keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
    ];

    if (
      !allowedKeys.includes(event.key) &&
      !(event.key >= "0" && event.key <= "9")
    ) {
      event.preventDefault();
    }
  };
  return (
    <>
      <TextField
        InputProps={
          disabledCode
            ? {}
            : {
                startAdornment: (
                  <Button
                    disableTouchRipple
                    disableRipple
                    disableFocusRipple
                    color="inherit"
                    variant="text"
                    {...bindTrigger(popupState)}
                    endIcon={
                      <CustomIcon icon="arrow_drop_down" iconColor="inherit" />
                    }
                    sx={{ fontSize: 14, textWrap: "nowrap", pl: 2, pr: 1 }}
                  >
                    {countryCallingCode}
                  </Button>
                ),
                sx: { pl: 0 },
              }
        }
        label={label}
        {...generateTextFieldFormProps(name, formProps)}
        {...props}
        onKeyDown={handleKeyDown}
      />
      {popupState.isOpen && (
        <CustomCountryDialog
          value={countryCallingCode}
          onChange={onCountryChange}
          popupState={popupState}
        />
      )}
    </>
  );
}

export default MobileNumberForm;

function CustomCountryDialog({
  value,
  onChange,
  popupState,
}: {
  value: string;
  onChange?: (e: string) => void;
  popupState: PopupState;
}) {
  const countryCodeValue = findOne(
    "countryCallingCode" as CountryProperty,
    checkCountryCode(value)
  ).countryCode;
  const [search, setSearch] = useState<string>("");
  const dataMemo = useMemo(() => {
    const data = getData();

    const newData = uniqBy(
      data.map((country) => {
        const callingCode = findOne(
          "countryCode" as CountryProperty,
          country.code
        ).countryCallingCode.toString();
        return { ...country, callingCode };
      }),
      "callingCode"
    );
    if (newData && search) {
      const searchData = filter(newData, (country) => {
        return (
          includes(
            country.name.toString().toLowerCase(),
            search.toString().toLowerCase()
          ) ||
          includes(
            replaceStringAll(
              replaceStringAll(country.name.toString().toLowerCase(), ",", ""),
              " ",
              ""
            ),
            replaceStringAll(
              replaceStringAll(search.toString().toLowerCase(), ",", ""),
              " ",
              ""
            )
          )
        );
      });
      return [...searchData];
    } else return newData;
  }, [search]);

  return (
    <>
      <Popover
        {...bindPopover(popupState)}
        slotProps={{ paper: { sx: { width: "25%" } } }}
        transitionDuration={{ appear: 300, exit: 0 }}
        onClose={() => {
          setSearch("");
          popupState.close();
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            autoFocus
            placeholder="Search..."
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
            }}
          />
        </Box>
        <Virtuoso
          initialTopMostItemIndex={
            findIndex(dataMemo, {
              code: countryCodeValue,
            }) > -1
              ? findIndex(dataMemo, {
                  code: countryCodeValue,
                })
              : 0
          }
          overscan={30}
          style={{ height: 400 }}
          data={dataMemo}
          itemContent={(index, { code, name, callingCode }) => {
            return (
              <ListItem disablePadding disableGutters key={index}>
                <ListItemButton
                  autoFocus={code === countryCodeValue}
                  selected={code === countryCodeValue}
                  onClick={() => {
                    if (onChange) {
                      onChange("+" + callingCode);
                    }
                    popupState.close();
                  }}
                >
                  <Stack
                    spacing={1}
                    direction="row"
                    sx={{ width: "100%", alignItems: "center" }}
                  >
                    <Box
                      component="img"
                      src={`https://flagsapi.com/${code}/flat/16.png`}
                      sx={{ minWidth: "16px" }}
                    />
                    <ListItemText>
                      {name} +{callingCode}
                    </ListItemText>
                  </Stack>
                </ListItemButton>
              </ListItem>
            );
          }}
        />
      </Popover>
    </>
  );
}

function checkCountryCode(string: string): string {
  if (startsWith(string, "+")) {
    string = string.substring(1); // or inputString = inputString.slice(1);
  }

  return string;
}
