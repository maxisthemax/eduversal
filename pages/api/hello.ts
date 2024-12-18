import { NextApiRequest, NextApiResponse } from "next";
//import { getIronSession } from "iron-session";

//*lib
//import { SessionData, sessionOptions } from "@/lib/session";
import prisma from "lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }
  const { email, password }: { email: string; password: string } = req.body;
  // const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // console.log(session);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    res.status(200).json({
      message: "Sign In successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Sign In failed", error });
  }
}
