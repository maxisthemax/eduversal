import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

//*utils
import { sendEmail } from "@/utils/email";

const prisma = new PrismaClient();

export default async function forgotPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", type: "USER_NOT_FOUND" });
    }

    // Check if the user is verified
    if (!user.is_verified) {
      return res.status(400).json({
        message: "User not verified, please check your email to verify",
        type: "USER_NOT_VERIFIED",
      });
    }

    // Generate reset token and expiry
    const reset_token = uuidv4();
    const reset_token_expiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

    // Upsert verification entry in the database
    await prisma.verification.upsert({
      where: { user_id: user.id },
      update: {
        token: reset_token,
        token_expiry: reset_token_expiry,
      },
      create: {
        token: reset_token,
        token_expiry: reset_token_expiry,
        type: "PASSWORD_RESET",
        user_id: user.id,
      },
    });

    // Generate reset link
    const resetLink = `${
      process.env.NEXT_PUBLIC_URL
    }/resetpassword?token=${reset_token}&email=${encodeURIComponent(email)}`;

    // Send reset email using the helper function
    await sendEmail({
      from: process.env.NEXT_EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Please reset your password by clicking the following link:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    return res.status(200).json({
      message: "Password reset email sent. Please check your email.",
      type: "SUCCESS",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send password reset email",
      type: "SERVER_ERROR",
      error,
    });
  }
}
