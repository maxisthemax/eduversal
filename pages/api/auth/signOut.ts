import { NextApiRequest, NextApiResponse } from "next";

//*helpers
import { handleAllowedMethods, getSession } from "@/helpers/apiHelpers";

export default async function signOut(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Get the session
  const session = await getSession(req, res);
  session.destroy();

  // Respond with a success message
  res.status(200).json({
    message: "Logged out successfully",
    type: "LOGGED_OUT_SUCCESSFULLY",
  });
}
