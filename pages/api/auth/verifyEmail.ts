import { NextApiRequest, NextApiResponse } from "next";

//*helpers
import {
  emailRegex,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

//*lib
import prisma from "@/lib/prisma";

export default async function verifyEmail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Extract from request body
  const { token, email } = req.body;

  // Validate required fields
  if (!validateRequiredFields(req, res, ["email", "token"])) {
    return;
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      type: "INVALID_EMAIL_FORMAT",
    });
  }

  try {
    // Find the user with the matching email and include verification details
    const user = await prisma.user.findUnique({
      where: { email: email as string },
      include: { verification: true },
    });

    // If user does not exist, return an error
    if (!user) {
      return res.status(400).json({
        message: "Invalid verification link.",
        type: "INVALID_VERIFICATION_LINK",
      });
    }

    // If user is already verified, return a success message
    if (user.is_verified) {
      return res.status(200).json({
        message: "Email is already verified. Please Sign In",
        type: "EMAIL_ALREADY_VERIFIED",
      });
    }

    const verification = user.verification;

    // Validate the verification token
    if (
      !verification ||
      verification.type !== "EMAIL_VERIFICATION" ||
      verification.token !== token
    ) {
      return res.status(400).json({
        message: "Invalid verification token.",
        type: "INVALID_VERIFICATION_TOKEN",
      });
    }

    // Check if the verification token has expired
    if (verification.token_expiry < new Date()) {
      return res.status(400).json({
        message: "Verification token has expired.",
        type: "VERIFICATION_TOKEN_EXPIRED",
      });
    }

    // Update user to set is_verified to true and remove verification record
    await prisma.$transaction([
      prisma.user.update({
        where: { email: email as string },
        data: {
          is_verified: true,
        },
      }),
      prisma.verification.delete({
        where: { user_id: user.id },
      }),
    ]);

    // Return success message
    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
      type: "EMAIL_VERIFIED_SUCCESSFULLY",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      message: "Internal server error",
      error,
      type: "INTERNAL_SERVER_ERROR",
    });
  }
}
