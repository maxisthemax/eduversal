import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function albumHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        const { albumId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["albumId"], "query")) {
          return;
        }

        // Update an existing album
        const { name, description, type } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the album
        const updatedalbum = await prisma.album.update({
          where: { id: albumId as string },
          data: {
            name,
            description,
            type,
            ...updated_by,
          },
        });

        // Return the updated album
        return res.status(200).json({ data: updatedalbum });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT"])) return;
    }
  } catch (error) {
    // Handle any errors
    if (error.code === "P2002") {
      return res.status(500).json({
        message: `Duplicate field: ${error.meta.target.join(", ")}`,
        error,
      });
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
