import startCase from "lodash/startCase";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Validates that all required fields are present and not empty.
 *
 * @param fields - An array of field values to validate.
 * @param res - The NextApiResponse object to send the error response if validation fails.
 * @returns A boolean indicating whether the validation failed (`true`) or passed (`false`).
 */
export function validateRequiredFields(
  req: NextApiRequest,
  res: NextApiResponse,
  fields: string[]
): boolean {
  const missingFields = fields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value === "";
  });
  if (missingFields.length > 0) {
    const formattedFields = formatList(missingFields);
    const verb = missingFields.length === 1 ? "is" : "are";
    const message = `${formattedFields} ${verb} required.`;

    res.status(400).json({ message });
    return false;
  }

  return true;
}

function formatList(items: string[]): string {
  if (items.length === 1) {
    return startCase(items[0]);
  } else if (items.length === 2) {
    return `${startCase(items[0])} and ${startCase(items[1])}`;
  } else {
    const lastItem = items.pop()!;
    const formattedItems = items.map((item) => startCase(item));
    return `${formattedItems.join(", ")}, and ${startCase(lastItem)}`;
  }
}
