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
      case "GET": {
        // Fetch all institution types
        const institutionType = await prisma.institutionType.findMany({
          orderBy: { name: "asc" },
        });

        // Return the institution types
        return res.status(200).json({ data: institutionType });
      }
      case "POST": {
        // Create a new institution type
        const { name } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["name"])) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new institution type
        const newInstitutionType = await prisma.institutionType.create({
          data: {
            name,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created institution type
        return res.status(201).json({ data: newInstitutionType });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
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
