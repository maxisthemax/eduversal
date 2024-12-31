import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function academicYearHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        // Get institution_id from query
        const { institution_id } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institution_id"])) {
          return;
        }

        // Fetch academic years for the given institution_id
        const academicYears = await prisma.academicYear.findMany({
          where: { institution_id: institution_id as string },
          orderBy: [
            {
              year: "desc",
            },
            {
              name: "asc",
            },
          ],
        });

        // Return the academic years
        return res.status(200).json({ data: academicYears });
      }
      case "POST": {
        // Create a new academic year
        const { name, year, start_date, end_date, institution_id } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "name",
            "year",
            "start_date",
            "end_date",
            "institution_id",
          ])
        ) {
          return;
        }

        // Get createdBy and updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Create the new academic year
        const newAcademicYear = await prisma.academicYear.create({
          data: {
            name,
            year,
            start_date,
            end_date,
            institution_id,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created academic year
        return res.status(201).json({ data: newAcademicYear });
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
