import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
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
        const { code } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["code"])) {
          return;
        }

        // Fetch courses for the given institutionId and academicYearId
        const course = await prisma.course.findUnique({
          where: {
            access_code: code as string,
            force_disable: false,
          },
          select: {
            academicYear: { select: { year: true, id: true, name: true } },
            standard: { select: { name: true, id: true } },
            end_date: true,
            name: true,
            id: true,
          },
        });

        // Return the courses
        return res.status(200).json({ data: course });
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
