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
        const { institutionId, academicYearId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, ["institutionId", "academicYearId"])
        ) {
          return;
        }

        // Fetch courses for the given institutionId and academicYearId
        const courses = await prisma.course.findMany({
          where: {
            institution_id: institutionId as string,
            academic_year_id: academicYearId as string,
          },
          include: { standard: true },
          orderBy: [
            {
              name: "asc",
            },
          ],
        });

        // Return the courses
        return res.status(200).json({ data: courses });
      }
      case "POST": {
        const { institutionId, academicYearId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["institutionId", "academicYearId"],
            "query"
          )
        ) {
          return;
        }

        // Create a new course
        const {
          name,
          access_code,
          standard_id,
          valid_period,
          start_date,
          end_date,
        } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "name",
            "access_code",
            "standard_id",
            "start_date",
            "end_date",
            "valid_period",
          ])
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new course
        const newCourse = await prisma.course.create({
          data: {
            name,
            access_code,
            standard_id,
            start_date,
            end_date,
            valid_period,
            institution_id: institutionId as string,
            academic_year_id: academicYearId as string,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created course
        return res.status(201).json({ data: newCourse });
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
