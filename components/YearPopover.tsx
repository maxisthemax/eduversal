import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";

//*components
import { CustomIcon } from "@/components/Icons";

//*material
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import MenuItem from "@mui/material/MenuItem";

//*hooks
import { formatDate, getYear, startOfMonth } from "date-fns";
import orderBy from "lodash/orderBy";

/**
 * Props for the YearAndMonthPopover component
 */
export interface YearAndMonthPopoverProps {
  date: Date;
  onChange?: (date: Date) => void;
}

/**
 * `YearAndMonthPopover` is a Material-UI component that provides a dropdown selection for year and month.
 * It is built using the Material-UI PopupState, bindPopover, and bindTrigger functionalities, which manage the popup state.
 *
 * @params
 * @param date - The currently selected date. It is a JavaScript Date object.
 * @param selected - A boolean value indicating whether the date has been selected.
 * @param onChange - A callback function that's fired when a year and month are selected. The selected year and month are passed to this function.
 * @param disabled - A boolean indicating whether the Popover is disabled. Defaults to 'false'.
 * @param size - The size of the button that triggers the popover. Can be one of 'small', 'medium', 'large'. Defaults to 'small'.
 * @param variant - The variant of the button that triggers the popover. Can be one of 'text', 'contained', 'outlined'. Defaults to 'contained'.
 *
 * @component
 * @example
 * <YearAndMonthPopover
 *   date={new Date()}
 *   selected={true}
 * />
 */

function YearAndMonthPopover({ date, onChange }: YearAndMonthPopoverProps) {
  return (
    <PopupState variant="popover">
      {(yearPopupState) => (
        <>
          <Button
            {...bindTrigger(yearPopupState)}
            variant={"outlined"}
            color={"primary"}
            size={"small"}
          >
            {formatDate(new Date(date), "yyyy")}
            <CustomIcon icon="arrow_drop_down" iconColor="inherit" />
          </Button>

          <Popover
            {...bindPopover(yearPopupState)}
            sx={{ height: "50vh", mt: 0.5 }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <List dense={true} disablePadding>
              {getAllMonths().map(({ value }) => {
                return (
                  <MenuItem
                    key={value}
                    selected={value === formatDate(date, "yyyy")}
                    dense={true}
                    onClick={() => {
                      onChange(new Date(Number(value), 1, 1));
                    }}
                  >
                    {value}
                  </MenuItem>
                );
              })}
            </List>
          </Popover>
        </>
      )}
    </PopupState>
  );
}

export default YearAndMonthPopover;

interface Month {
  monthName: string;
  monthShortName: string;
  month: string;
  year: string;
}

interface Year {
  value: string;
  months: Month[];
}

export function getAllMonths(fromYear = 2021) {
  const years: Year[] = [];
  const currentYear = getYear(new Date());

  for (let year = fromYear; year <= currentYear; year++) {
    const yearObj: Year = {
      value: year.toString(),
      months: [],
    };
    for (let month = 0; month < 12; month++) {
      const date = startOfMonth(new Date(year, month, 1));
      const monthObj: Month = {
        monthName: formatDate(date, "MMMM"),
        monthShortName: formatDate(date, "MMM"),
        month: formatDate(date, "M"),
        year: formatDate(date, "yyyy"),
      };
      yearObj.months.push(monthObj);
    }
    if (yearObj.months.length > 0) {
      years.push(yearObj);
    }
  }

  return orderBy(years, ["value"], ["desc"]);
}
