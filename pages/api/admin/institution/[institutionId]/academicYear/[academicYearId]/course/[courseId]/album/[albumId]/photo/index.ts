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

        // Create a new album
        const { name, display_url, download_url } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "name",
            "display_url",
            "download_url",
          ])
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new album
        const newAlbum = await prisma.photo.create({
          data: {
            name,
            display_url,
            download_url,
            institution_id: institutionId as string,
            album_id: albumId as string,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created album
        return res.status(201).json({ data: newAlbum });
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
