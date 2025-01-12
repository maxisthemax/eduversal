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
      case "PUT": {
        const { academicYearId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["academicYearId"], "query")) {
          return;
        }

        // Update an existing academic year
        const { name, year, start_date, end_date } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the academic year
        const updatedAcademicYear = await prisma.academicYear.update({
          where: { id: academicYearId as string },
          data: {
            name,
            year,
            start_date,
            end_date,
            ...updated_by,
          },
        });

        // Return the updated academic year
        return res.status(200).json({ data: updatedAcademicYear });
      }

      case "DELETE": {
        const { academicYearId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["academicYearId"], "query")) {
          return;
        }

        // Delete the academic year
        await prisma.academicYear.delete({
          where: { id: academicYearId as string },
        });

        // Return a success message
        return res
          .status(200)
          .json({ message: "Academic year deleted successfully" });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT", "DELETE"])) return;
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
