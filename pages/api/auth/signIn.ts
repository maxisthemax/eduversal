import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import bcrypt from "bcrypt";
import Cors from "cors";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "OPTIONS"],
    origin: "https://eduversal.vercel.app", // Replace with your actual origin
  })
);

export default async function signInHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  const { email, password }: { email: string; password: string } = req.body;
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      session.destroy();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a session and store user data
    session.id = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    res.status(200).json({
      message: "Sign In successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Sign In failed", error });
  }
}

function initMiddleware(middleware) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
