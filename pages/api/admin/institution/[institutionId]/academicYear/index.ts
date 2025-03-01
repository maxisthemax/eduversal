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
        // Get institutionId from query
        const { institutionId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId"])) {
          return;
        }

        // Fetch academic years for the given institutionId][\5]
        const academicYears = await prisma.academicYear.findMany({
          where: { institution_id: institutionId as string },
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
        const { institutionId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["institutionId"], "query")) {
          return;
        }

        // Create a new academic year
        const { name, year, start_date, end_date } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, [
            "name",
            "year",
            "start_date",
            "end_date",
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
            institution_id: institutionId as string,
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
