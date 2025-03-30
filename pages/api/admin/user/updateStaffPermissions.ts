import {
  getSession,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";
import { NextApiRequest, NextApiResponse } from "next";

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
        if (!validateRequiredFields(req, res, ["staffId", "permissions"])) {
          return;
        }

        //create new order
        const { staffId, permissions } = req.body;

        await prisma.user.update({
          where: {
            id: staffId,
          },
          data: {
            permissions,
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
