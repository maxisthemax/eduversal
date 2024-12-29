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
      case "GET":
        // Fetch all institutions with their types
        const institutions = await prisma.institution.findMany({
          include: { type: true },
          orderBy: { name: "desc" },
        });

        // Return the institutions
        return res.status(200).json({ data: institutions });

      case "POST":
        // Create a new institution
        const { name, type_id, code } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["name", "type_id", "code"])) {
          return;
        }

        // Get createdBy and updatedBy
        const createdByUpdatedBy = await getCreatedByUpdatedBy(req, res);

        // Create the new institution
        const newInstitution = await prisma.institution.create({
          data: {
            name,
            type_id,
            code,
            ...createdByUpdatedBy,
          },
        });

        // Return the newly created institution
        return res.status(201).json({ data: newInstitution });

      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
    }
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
