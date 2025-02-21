import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { courseId } = req.query;
  try {
    switch (req.method) {
      case "GET": {
        // Fetch all packages ordered by name in ascending order
        const packages = await prisma.package.findMany({
          orderBy: { name: "asc" },
          where: { course_id: courseId as string },
          select: {
            id: true,
            name: true,
            description: true,
            is_downloadable: true,
            preview_url: true,
            preview_url_key: true,
            currency: true,
            price: true,
            course_id: true,
            institution_id: true,
            created_at: true,
            updated_at: true,
            packageAlbums: {
              select: {
                album_id: true,
                quantity: true,
              },
            },
          },
        });

        // Return the packages
        return res.status(200).json({ data: packages });
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

        const {
          name,
          is_downloadable,
          preview_url,
          preview_url_key,
          description,
          currency,
          price,
          albums,
        } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "name",
            "is_downloadable",
            "currency",
            "price",
            "albums",
          ])
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Start a Prisma transaction
        const result = await prisma.$transaction(async (prisma) => {
          const result = await prisma.package.create({
            data: {
              name,
              description,
              preview_url,
              preview_url_key,
              is_downloadable,
              currency,
              price,
              institution_id: institutionId as string,
              course_id: courseId as string,
              ...created_by,
              ...updated_by,
            },
          });

          await prisma.packageAlbum.createMany({
            data: albums.map(({ album_id, quantity }) => ({
              package_id: result.id,
              album_id: album_id,
              quantity: quantity,
              ...created_by,
              ...updated_by,
            })),
          });

          return result;
        });

        // Use handleAllowedMethods for method validation
        return res.status(201).json({ data: result });
      }

      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
      }
    }
  } catch (error) {
    switch (error.code) {
      case "P2002":
        // Handle duplicate field error
        return res.status(500).json({
          message: `Duplicate field: ${error.meta.target.join(", ")}`,
          error,
        });
      default:
        break;
    }
    // Handle other errors
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
