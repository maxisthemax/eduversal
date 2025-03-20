import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

//*functions
import { deleteFile } from "@/pages/api/functions/upload";

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
        const {
          name,
          description,
          product_type_id,
          product_variations_id,
          preview_url,
          preview_url_key,
        } = req.body;

        // Get updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Update the album
        const result = await prisma.$transaction(async (prisma) => {
          await prisma.album.update({
            where: { id: albumId as string },
            data: {
              name,
              description,
              product_type_id,
              preview_url,
              preview_url_key,
              ...updated_by,
            },
          });

          // Fetch existing product variations for the album
          const existingVariations =
            await prisma.albumProductVariation.findMany({
              where: { album_id: albumId as string },
            });

          const existingVariationIds = existingVariations.map(
            (v) => v.productVariation_id
          );

          // Determine variations to remove
          const variationsToRemove = existingVariationIds.filter(
            (id) => !product_variations_id.includes(id)
          );

          // Remove the variations that are not in the new list
          if (variationsToRemove.length > 0) {
            await prisma.albumProductVariation.deleteMany({
              where: {
                album_id: albumId as string,
                productVariation_id: { in: variationsToRemove },
              },
            });
          }

          // Add new variations
          const newVariations = product_variations_id.filter(
            (id) => !existingVariationIds.includes(id)
          );

          if (newVariations.length > 0) {
            await prisma.albumProductVariation.createMany({
              data: newVariations.map((variationId) => ({
                album_id: albumId as string,
                productVariation_id: variationId,
                ...created_by,
                ...updated_by,
              })),
            });
          }
        });

        // Return the updated album
        return res.status(200).json({ data: result });
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

          await deleteFile(keys);
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
