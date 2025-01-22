import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function courseHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        // Get institutionId and academicYearId from query
        const { userId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["userId"])) {
          return;
        }

        // Fetch courses for the given institutionId and academicYearId
        const courses = await prisma.userCourse.findMany({
          where: {
            user_id: userId as string,
            course: { end_date: { gte: new Date() } },
          },
          select: {
            id: true,
            names: true,
            course_id: true,
            course: {
              select: {
                academicYear: { select: { year: true } },
                name: true,
                standard: { select: { name: true } },
                albums: {
                  select: {
                    photos: {
                      select: { name: true, display_url: true },
                    },
                    name: true,
                  },
                },
                end_date: true,
              },
            },
          },
        });

        // Return the courses
        return res.status(200).json({ data: courses });
      }

      case "POST": {
        // Get institutionId and academicYearId from query
        const { userId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["userId"], "query")) {
          return;
        }

        // Get the names and course_id from the request body
        const { names, course_id } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["names", "course_id"])) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new academic year
        const newCourse = await prisma.userCourse.create({
          data: {
            names,
            course_id,
            user_id: userId as string,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created academic year
        return res.status(201).json({ data: newCourse });
      }

      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["GET"])) return;
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
