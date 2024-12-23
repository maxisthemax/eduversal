import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

// API route handler for signing out
export default async function signOutHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the request method is POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get the session and destroy it
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  // Respond with a success message
  res.status(200).json({ message: "Logged out successfully" });
}
