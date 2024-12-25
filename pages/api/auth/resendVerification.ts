import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

//*lib
import prisma from "@/lib/prisma";

//*utils
import { sendEmail } from "@/utils/email";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

export default async function resendVerificationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  const { email } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      type: "INVALID_EMAIL_FORMAT",
    });
  }

  try {
    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.is_verified) {
      return res.status(404).json({
        message: "User not found or already verified",
        type: "USER_NOT_FOUND_OR_ALREADY_VERIFIED",
      });
    }

    // Generate new verification token and expiry
    const verification_token = uuidv4();
    const verification_token_expiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // Update verification entry in the database
    await prisma.verification.upsert({
      where: { user_id: user.id },
      update: {
        token: verification_token,
        token_expiry: verification_token_expiry,
      },
      create: {
        token: verification_token,
        token_expiry: verification_token_expiry,
        user_id: user.id,
        type: "EMAIL_VERIFICATION",
      },
    });

    // Generate verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_URL
    }/verifyemail?token=${verification_token}&email=${encodeURIComponent(
      email
    )}`;

    // Validate environment variables
    if (!process.env.NEXT_EMAIL_USER || !process.env.NEXT_EMAIL_PASS) {
      throw new Error("Email environment variables are not set");
    }

    // Send verification email
    await sendEmail({
      from: process.env.NEXT_EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Please verify your email by clicking the following link:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    // Respond with success message
    res.status(200).json({
      message: "Verification email resent successfully",
      type: "VERIFICATION_EMAIL_RESENT",
    });
  } catch (error) {
    console.error("Resend verification failed:", error);
    res.status(500).json({
      message: "Resend verification failed",
      error,
      type: "RESEND_VERIFICATION_FAILED",
    });
  }
}
