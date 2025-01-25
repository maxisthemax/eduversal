import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

//*api
import { deletePhotosFromS3 } from "@/pages/api/admin/photo/deletePhoto";

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
        const { name, description, product_type_id } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the album
        const updatedalbum = await prisma.album.update({
          where: { id: albumId as string },
          data: {
            name,
            description,
            product_type_id,
            ...updated_by,
          },
        });

        // Return the updated album
        return res.status(200).json({ data: updatedalbum });
      }
      case "DELETE": {
        const { albumId, institutionId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["albumId", "institutionId"],
            "query"
          )
        ) {
          return;
        }

        // Use Prisma transaction
        await prisma.$transaction(async (prisma) => {
          // Get the photos associated with the album
          const photos = await prisma.photo.findMany({
            where: {
              institution_id: institutionId as string,
              album_id: albumId as string,
            },
          });

          // Delete the photos
          await prisma.photo.deleteMany({
            where: {
              institution_id: institutionId as string,
              album_id: albumId as string,
            },
          });

          // Delete an existing album
          await prisma.album.delete({
            where: { id: albumId as string },
          });

          const keys = [];
          photos.forEach(({ download_url, download_watermark_url }) => {
            keys.push(download_url);
            keys.push(download_watermark_url);
          });

          await deletePhotosFromS3(keys);
        });

        return res.status(200).json({
          message: "Album and associated photos deleted successfully",
        });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT", "DELETE"])) return;
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
