import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import dayjs from "dayjs";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";

//*lodash
import startCase from "lodash/startCase";

export function validateRequiredFields(
  req: NextApiRequest,
  res: NextApiResponse,
  fields: string[]
): boolean {
  const missingFieldsBody =
    req.body &&
    fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

  const missingFieldsQuery =
    req.query &&
    fields.filter((field) => {
      const value = req.query[field];
      return value === undefined || value === null || value === "";
    });

  if (missingFieldsBody.length > 0) {
    const formattedFields = formatList(missingFieldsBody);
    const verb = missingFieldsBody.length === 1 ? "is" : "are";
    const message = `${formattedFields} ${verb} required.`;

    res.status(400).json({ message });
    return false;
  }

  if (missingFieldsQuery.length > 0) {
    const formattedFields = formatList(missingFieldsQuery);
    const verb = missingFieldsQuery.length === 1 ? "is" : "are";
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

export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse,
  remember_me: boolean = false
) {
  const options = { ...sessionOptions };
  if (remember_me) {
    options.cookieOptions.maxAge = 60 * 60 * 24 * 60; // 60 days
  }
  return await getIronSession<SessionData>(req, res, options);
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[A-Z]).{8,}$/;

export async function checkRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  limit: number = 10
) {
  // Get the session
  const session = await getSession(req, res);
  if (!session?.id)
    return res.status(429).json({
      message: "User is signed out",
      type: "USER_SIGNED_OUT",
    });

  // Rate limit check
  if (!session?.rateLimitLastAt) {
    session.rateLimit = 0;
  }

  if (
    session.rateLimit &&
    session.rateLimit > limit &&
    dayjs().diff(dayjs(session.rateLimitLastAt), "minute") < 1
  ) {
    return res.status(429).json({
      message: "Too many requests, please try again later",
      type: "RATE_LIMIT_EXCEEDED",
    });
  }

  // Reset rate limit if more than 1 minute has passed
  if (
    !session.rateLimit ||
    dayjs().diff(dayjs(session.rateLimitLastAt), "minute") >= 1
  ) {
    session.rateLimit = 0;
  }

  // Increment rate limit counter
  session.rateLimit = (session.rateLimit || 0) + 1;
  session.rateLimitLastAt = new Date();
  session.save();
}

export async function getCreatedByUpdatedBy(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  return {
    created_by_name: session.name,
    updated_by_name: session.name,
    created_by_user_id: session.id,
    updated_by_user_id: session.id,
  };
}
