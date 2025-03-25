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
        const { courseId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["courseId"], "query")) {
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
          force_disable,
        } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the course
        const updatedCourse = await prisma.course.update({
          where: { id: courseId as string },
          data: {
            name,
            access_code,
            force_disable,
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

      case "DELETE": {
        const { courseId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["courseId"], "query")) {
          return;
        }

        // Delete the course
        await prisma.course.delete({
          where: { id: courseId as string },
        });

        // Return a success message
        return res.status(200).json({ message: "Course deleted successfully" });
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
