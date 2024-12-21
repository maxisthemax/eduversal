import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

export default async function signOutHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  res.status(200).json({ message: "Logged out successfully" });
}
