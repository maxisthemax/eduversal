import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function photoHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        const { photoId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["photoId"], "query")) {
          return;
        }

        // Update an existing photo's file name
        const { name } = req.body;

        if (!validateRequiredFields(req, res, ["name"], "body")) {
          return;
        }

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the photo
        const updatedPhoto = await prisma.photo.update({
          where: { id: photoId as string },
          data: {
            name,
            ...updated_by,
          },
        });

        // Return the updated photo
        return res.status(200).json({ data: updatedPhoto });
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
