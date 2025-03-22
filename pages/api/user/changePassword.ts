import {
  getSession,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

//*lib
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  if (!session?.id)
    return res.status(429).json({
      message: "User is signed out",
      type: "USER_SIGNED_OUT",
    });

  try {
    switch (req.method) {
      case "POST": {
        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "password",
            "new_password",
            "confirm_password",
          ])
        ) {
          return;
        }
        const user = await prisma.user.findUnique({
          where: { id: session.id },
          select: {
            password: true,
          },
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        //create new order
        const { password, new_password, confirm_password } = req.body;
        // Verify current password
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        if (new_password !== confirm_password) {
          return res.status(400).json({
            message: "New password and confirm password do not match",
          });
        }

        // Check if new password is same as current password
        const sameAsOld = await bcrypt.compare(new_password, user.password);
        if (sameAsOld) {
          return res.status(400).json({
            message: "New password must be different from current password",
          });
        }

        // Hash the password
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        await prisma.user.update({
          where: {
            id: session.id,
          },
          data: {
            password: hashedNewPassword,
          },
        });

        // Return the newly created product type
        return res.status(201).json({ message: "Success" });
      }

      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["POST"])) return;
      }
    }
  } catch (error) {
    switch (error.code) {
      case "P2002":
        // Handle duplicate field error
        return res.status(500).json({
          message: `Duplicate field: ${error.meta.target.join(", ")}`,
          error,
        });
      default:
        break;
    }
    // Handle other errors
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
