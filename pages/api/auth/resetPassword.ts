import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function resetPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token, email, new_password } = req.body;

  // Validate password strength
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[A-Z]).{8,}$/;
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
      const user = await prisma.user.findUnique({
        where: { email },
        include: { verification: true },
      });

      const verification = user?.verification;

      if (!verification || verification.type !== "PASSWORD_RESET") {
        throw { message: "Invalid or expired token", type: "INVALID_TOKEN" };
      }

      // Check if the token matches
      if (verification.token !== token) {
        throw { message: "Invalid token", type: "INVALID_TOKEN" };
      }

      // Check if the token is expired
      if (verification.token_expiry < new Date()) {
        throw { message: "Token expired", type: "TOKEN_EXPIRED" };
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update the user's password
      await prisma.user.update({
        where: { email },
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
  } finally {
    await prisma.$disconnect();
  }
}
