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
      case "PUT": {
        const { course_id } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["course_id"], "query")) {
          return;
        }

        // Update an existing course
        const {
          name,
          access_code,
          standard_id,
          start_date,
          end_date,
          valid_period,
        } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the course
        const updatedCourse = await prisma.course.update({
          where: { id: course_id as string },
          data: {
            name,
            access_code,
            standard_id,
            start_date,
            end_date,
            valid_period,
            ...updated_by,
          },
        });

        // Return the updated course
        return res.status(200).json({ data: updatedCourse });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT"])) return;
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
