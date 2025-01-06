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
        // Get institutionId and albumId from query
        const { institutionId, albumId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId", "albumId"])) {
          return;
        }

        // Fetch albums for the given institutionId and albumId
        const albums = await prisma.photo.findMany({
          where: {
            institution_id: institutionId as string,
            album_id: albumId as string,
          },
          orderBy: [
            {
              name: "asc",
            },
          ],
        });

        // Return the albums
        return res.status(200).json({ data: albums });
      }
      case "POST": {
        // Get institutionId and albumId from query
        const { institutionId, albumId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["institutionId", "albumId"],
            "query"
          )
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create new albums
        const { photos } = req.body;

        // Validate required fields
        if (!photos || !Array.isArray(photos) || photos.length === 0) {
          return res.status(400).json({
            message: "No photos provided or invalid format.",
          });
        }

        // Validate each photo
        if (!validateRequiredFields(req, res, ["photos"], "body")) {
          return;
        }

        // Prepare data for bulk insert
        const newPhotos = photos.map((photo) => ({
          ...photo,
          institution_id: institutionId as string,
          album_id: albumId as string,
          ...created_by,
          ...updated_by,
        }));

        // Filter out photos already present in the database
        const photosToCreate = [];
        for (const photo of newPhotos) {
          const existing = await prisma.photo.findFirst({
            where: {
              download_url: photo.download_url,
              album_id: albumId as string,
              institution_id: institutionId as string,
            },
          });
          if (!existing) {
            photosToCreate.push(photo);
          }
        }
        if (photosToCreate.length) {
          await prisma.photo.createMany({ data: photosToCreate });
        }

        // Return the newly created photos
        return res.status(201).json({ data: photosToCreate });
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
