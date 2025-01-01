import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        // Extract standardId from query parameters
        const { standardId } = req.query;

        // Validate required fields in query parameters
        if (!validateRequiredFields(req, res, ["standardId"], "query")) {
          return;
        }

        // Extract name from request body
        const { name } = req.body;

        // Get updated_by information
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the standard in the database
        const updatedStandard = await prisma.standard.update({
          where: { id: standardId as string },
          data: {
            name,
            ...updated_by,
          },
        });

        // Return the updated standard
        return res.status(200).json({ data: updatedStandard });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["PUT"])) return;
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