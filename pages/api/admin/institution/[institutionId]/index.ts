import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function institutionsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        // Update an existing institution
        const { institutionId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId"], "query")) {
          return;
        }

        // Update an existing institution
        const { name, type_id, code } = req.body;

        // Get  updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the institution
        const updatedInstitution = await prisma.institution.update({
          where: { id: institutionId as string },
          data: {
            name,
            type_id,
            code,
            ...updated_by,
          },
        });

        // Return the updated institution
        return res.status(200).json({ data: updatedInstitution });
      }
      case "DELETE": {
        // Delete an existing institution
        const { institutionId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId"], "query")) {
          return;
        }

        // Delete the institution
        await prisma.institution.delete({
          where: { id: institutionId as string },
        });

        // Return a success message
        return res
          .status(200)
          .json({ message: "Institution deleted successfully" });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT", "DELETE"])) return;
    }
  } catch (error) {
    // Handle any errors
    switch (error.code) {
      case "P2002":
        return res.status(500).json({
          message: `Duplicate field: ${error.meta.target.join(", ")}`,
          error,
        });

      default:
        break;
    }

    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
