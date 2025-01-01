import { isDate } from "date-fns";

//*lodash
import isEmpty from "lodash/isEmpty";

export function checkSameValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentData: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newData: Record<string, any>
) {
  const updatedNewData = { ...newData };

  // Remove fields that have the same value
  Object.keys(newData).forEach((key) => {
    if (isDate(updatedNewData[key]) || isDate(currentData[key])) {
      if (updatedNewData[key].toString() === currentData[key].toString()) {
        delete updatedNewData[key];
      }
    } else if (updatedNewData[key] === currentData[key]) {
      console.log(updatedNewData[key]);
      console.log(currentData[key]);
      delete updatedNewData[key];
    }
  });

  return { changes: updatedNewData, isEmpty: isEmpty(updatedNewData) };
}
