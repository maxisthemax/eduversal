import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }
  const { email, password }: { email: string; password: string } = req.body;
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  console.log(session);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
}
