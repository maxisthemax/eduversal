import { NextApiRequest, NextApiResponse } from "next";

//*lodash
import startCase from "lodash/startCase";

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

export function handleAllowedMethods(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method!)) {
    res.setHeader("Allow", allowedMethods);
    res.status(405).json({
      message: `Only ${allowedMethods.join(", ")} requests are allowed`,
      type: "METHOD_NOT_ALLOWED",
    });
    return true;
  }
  return false;
}
