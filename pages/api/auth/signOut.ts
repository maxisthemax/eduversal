import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

// API route handler for signing out
export default async function signOutHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Get the session and destroy it
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  // Respond with a success message
  res.status(200).json({
    message: "Logged out successfully",
    type: "LOGGED_OUT_SUCCESSFULLY",
  });
}
