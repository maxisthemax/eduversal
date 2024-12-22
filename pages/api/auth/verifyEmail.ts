import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function verifyEmailHandler(req, res) {
  const { token, email } = req.query;
  console.log("🚀 ~ verifyEmailHandler ~ token:", token);

  if (!token || !email) {
    return res.status(400).json({ message: "Invalid verification link." });
  }

  try {
    // Find the user with the matching email and token
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification link." });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    if (user.verification_token !== token) {
      return res.status(400).json({ message: "Invalid verification token." });
    }

    if (user.verification_token_expiry < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification token has expired." });
    }

    // Update user to set isVerified to true and remove token fields
    await prisma.user.update({
      where: { email },
      data: {
        is_verified: true,
        verification_token: null,
        verification_token_expiry: null,
      },
    });

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}
