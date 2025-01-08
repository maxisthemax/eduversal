import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function photoHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST": {
        const { photoIds } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["photoIds"], "body")) {
          return;
        }

        if (!Array.isArray(photoIds) || !photoIds.length) {
          return res.status(400).json({ message: "No photo IDs provided." });
        }
        await prisma.photo.deleteMany({
          where: { id: { in: photoIds } },
        });
        return res.status(200).json({ message: "Photos deleted successfully" });
      }

      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["POST"])) return;
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
