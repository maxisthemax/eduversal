import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

//*lib
import prisma from "lib/prisma";

type SignUpRequest = {
  email: string;
  password: string;
  name: string;
};

export default async function signUpHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }
  const { email, password, name }: SignUpRequest = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
}
