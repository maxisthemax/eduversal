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
        // Get institutionTypeId from query
        const { institutionTypeId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionTypeId"], "query")) {
          return;
        }

        // Update the institution type
        const { name } = req.body;

        // Get createdBy and updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the institution type
        const updatedInstitutionType = await prisma.institutionType.update({
          where: { id: institutionTypeId as string },
          data: {
            name,
            ...updated_by,
          },
        });

        // Return the updated institution
        return res.status(200).json({ data: updatedInstitutionType });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET", "POST", "PUT"])) return;
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
