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
        // Fetch all standard types ordered by name in ascending order
        const standard = await prisma.standard.findMany({
          orderBy: { name: "asc" },
        });

        // Return the standard types
        return res.status(200).json({ data: standard });
      }
      case "POST": {
        // Extract name from request body
        const { name } = req.body;

        // Validate required fields in request body
        if (!validateRequiredFields(req, res, ["name"])) {
          return;
        }

        // Get created_by and updated_by information
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create a new standard type in the database
        const newStandard = await prisma.standard.create({
          data: {
            name,
            ...created_by,
            ...updated_by,
          },
        });
        // Return the newly created standard type
        return res.status(201).json({ data: newStandard });
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
