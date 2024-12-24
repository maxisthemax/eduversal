import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function verifyEmailHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      message: "Only GET requests are allowed",
      type: "ONLY_GET_REQUESTS_ALLOWED",
    });
  }

  // Extract token and email from query parameters
  const { token, email } = req.query as { token?: string; email?: string };

  // Validate presence of token and email
  if (!token || !email) {
    return res.status(400).json({
      message: "Invalid verification link.",
      type: "INVALID_VERIFICATION_LINK",
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
    if (!verification || verification.token !== token) {
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
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}
