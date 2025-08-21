import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

//*helpers
import {
  emailRegex,
  handleAllowedMethods,
  passwordRegex,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

//*lib
import prisma from "@/lib/prisma";

export default async function resetPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Extract the request body
  const { token, email, new_password } = req.body;

  // Validate required fields
  if (!validateRequiredFields(req, res, ["token", "email", "new_password"])) {
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
  if (!passwordRegex.test(new_password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, contain a number, an alphabet, and an uppercase letter",
      type: "WEAK_PASSWORD",
    });
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // Find the verification entry
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        include: { verification: true },
      });

      const verification = user?.verification;

      if (
        !verification ||
        verification.type !== "PASSWORD_RESET" ||
        verification.token !== token
      ) {
        throw {
          message: "Invalid or expired token",
          type: "INVALID_PASSWORD_RESET_TOKEN",
        };
      }

      // Check if the token is expired
      if (verification.token_expiry < new Date()) {
        throw {
          message: "Token expired",
          type: "PASSWORD_RESET_TOKEN_EXPIRED",
        };
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Delete the verification entry
      await prisma.verification.delete({
        where: { user_id: user.id },
      });
    });

    return res
      .status(200)
      .json({ message: "Password reset successfully", type: "SUCCESS" });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      type: error.type || "RESET_PASSWORD_ERROR",
    });
  }
}
