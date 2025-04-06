import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DatePicker as MuiDatePicker,
  DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import { startOfDay, endOfDay } from "date-fns";

export type MyDatePickerProps = DatePickerProps<Date> & {
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  mode?: "start" | "end";
};

function DatePicker(props: MyDatePickerProps) {
  const { mode = "start", label } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        format="dd/MM/yyyy"
        slotProps={{
          textField: {
            error: props.error,
            helperText: props.helperText,
            fullWidth: props?.fullWidth !== undefined ? props.fullWidth : true,
          },
        }}
        {...props}
        onChange={(value, context) => {
          if (value && props.onChange) {
            if (mode === "start") props.onChange(startOfDay(value), context);
            else props.onChange(endOfDay(value), context);
          }
        }}
        label={typeof label === "string" ? label ?? "" : label}
      />
    </LocalizationProvider>
  );
}

export default DatePicker;
