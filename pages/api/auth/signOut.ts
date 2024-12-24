import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

// API route handler for signing out
export default async function signOutHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      message: "Only POST requests are allowed",
      type: "ONLY_POST_REQUESTS_ALLOWED",
    });
  }

  // Get the session and destroy it
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  // Respond with a success message
  res.status(200).json({
    message: "Logged out successfully",
    type: "LOGGED_OUT_SUCCESSFULLY",
  });
}
