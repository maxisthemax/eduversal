import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

//*helpers
import {
  handleAllowedMethods,
  getSession,
  emailRegex,
  validateRequiredFields,
  passwordRegex,
} from "@/helpers/apiHelpers";

//*lib
import prisma from "@/lib/prisma";

export default async function signIn(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Extract from request body
  const { email, password, remember_me = false } = req.body;

  // Validate email and password
  if (!validateRequiredFields(req, res, ["email", "password"])) {
    return;
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      type: "INVALID_EMAIL_FORMAT",
    });
  }

  // Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, contain a number, an alphabet, and an uppercase letter",
      type: "WEAK_PASSWORD",
    });
  }

  // Get the session
  const session = await getSession(req, res, remember_me);

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    // Validate user and password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      session.destroy();
      return res.status(401).json({
        message: "Invalid email or password",
        type: "INVALID_EMAIL_OR_PASSWORD",
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      session.destroy();
      return res.status(403).json({
        message: "User is not verified",
        type: "USER_NOT_VERIFIED",
      });
    }

    // Create a session and store user data
    session.id = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    // Respond with success message and user data
    res.status(200).json({
      message: "Sign In successful",
      user: { id: user.id, email: user.email },
      type: "SIGN_IN_SUCCESSFUL",
    });
  } catch (error) {
    console.error("Sign In error:", error);
    res.status(500).json({
      message: "Sign In failed",
      error,
      type: "SIGN_IN_FAILED",
    });
  }
}
