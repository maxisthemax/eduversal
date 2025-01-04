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
        // Get institutionId and academicYearId from query
        const { institutionId, courseId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId", "courseId"])) {
          return;
        }

        // Fetch albums for the given institutionId and academicYearId
        const albums = await prisma.album.findMany({
          where: {
            institution_id: institutionId as string,
            course_id: courseId as string,
          },
          include: {
            photos: {
              select: {
                id: true,
                name: true,
                display_url: true,
                created_at: true,
              },
            },
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
        const { name, description, type } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, ["name", "description", "type"])
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new album
        const newAlbum = await prisma.album.create({
          data: {
            name,
            description,
            type,
            institution_id: institutionId as string,
            course_id: courseId as string,
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
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
