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
      case "GET": {
        // Get institutionId and courseId from query
        const { institutionId, courseId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId", "courseId"])) {
          return;
        }

        // Fetch albums for the given institutionId and courseId
        const albums = await prisma.album.findMany({
          where: {
            institution_id: institutionId as string,
            course_id: courseId as string,
          },
          orderBy: [
            {
              name: "asc",
            },
          ],
          include: { product_type: true, albumProductVariations: true },
        });

        // Return the albums
        return res.status(200).json({ data: albums });
      }
      case "POST": {
        // Get institutionId and courseId from query
        const { institutionId, courseId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["institutionId", "courseId"],
            "query"
          )
        ) {
          return;
        }

        // Create a new album
        const {
          name,
          description,
          product_type_id,
          album_product_variations,
          preview_url,
          preview_url_key,
        } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["name", "product_type_id"])) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Start a Prisma transaction
        const result = await prisma.$transaction(async (prisma) => {
          // Create the new album
          const newAlbum = await prisma.album.create({
            data: {
              name,
              description,
              product_type_id,
              institution_id: institutionId as string,
              course_id: courseId as string,
              preview_url,
              preview_url_key,
              ...created_by,
              ...updated_by,
            },
          });

          // If there are product variations, create them
          if (album_product_variations && album_product_variations.length > 0) {
            await prisma.albumProductVariation.createMany({
              data: album_product_variations.map(
                ({
                  productVariation_id,
                  mandatory,
                  disabled_options,
                }: {
                  productVariation_id: string;
                  mandatory: boolean;
                  disabled_options: string[];
                }) => ({
                  album_id: newAlbum.id,
                  productVariation_id,
                  mandatory,
                  disabled_options,
                  ...created_by,
                  ...updated_by,
                })
              ),
            });
          }

          return newAlbum;
        });

        // Return the newly created album
        return res.status(201).json({ data: result });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
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
      message: error.message || "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
