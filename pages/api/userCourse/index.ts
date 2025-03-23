import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  getUserId,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function courseHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserId(req, res);
  try {
    switch (req.method) {
      case "GET": {
        // Fetch courses for the given institutionId and academicYearId
        const courses = await prisma.userCourse.findMany({
          where: {
            user_id: userId,
            course: { end_date: { gte: new Date() } },
          },
          select: {
            id: true,
            names: true,
            course_id: true,
            course: {
              select: {
                id: true,
                academicYear: { select: { year: true } },
                name: true,
                standard: { select: { id: true, name: true } },
                end_date: true,
                albums: {
                  select: {
                    preview_url: true,
                    product_type: true,
                    id: true,
                    photos: {
                      select: {
                        id: true,
                        name: true,
                        display_url: true,
                        download_url: true,
                      },
                    },
                    name: true,
                    description: true,
                    albumProductVariations: {
                      select: {
                        productVariation: {
                          select: {
                            options: {
                              select: {
                                description: true,
                                id: true,
                                name: true,
                                preview_url: true,
                                preview_url_key: true,
                                price: true,
                                currency: true,
                              },
                            },
                            name: true,
                            description: true,
                            is_downloadable: true,
                            id: true,
                          },
                        },
                        productVariation_id: true,
                        mandatory: true,
                        options: true,
                      },
                    },
                  },
                },
                package: {
                  select: {
                    course_id: true,
                    currency: true,
                    description: true,
                    id: true,
                    is_downloadable: true,
                    name: true,
                    preview_url: true,
                    preview_url_key: true,
                    price: true,
                    packageAlbums: {
                      select: { album_id: true, quantity: true },
                    },
                  },
                },
              },
            },
          },
        });

        // Return the courses
        return res.status(200).json({ data: courses });
      }

      case "POST": {
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

        // Check if the user course already exists
        const userCourse = await prisma.userCourse.findFirst({
          where: {
            user_id: userId,
            course_id,
          },
        });

        if (userCourse) {
          return res.status(400).json({
            message: "User Course already exists",
          });
        }

        // Create the new academic year
        const newCourse = await prisma.userCourse.create({
          data: {
            names,
            course_id,
            user_id: userId,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created academic year
        return res.status(201).json({ data: newCourse });
      }

      case "PUT": {
        // Get the names and user_course_id from the request body
        const { names, user_course_id } = req.body;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["names", "user_course_id"])) {
          return;
        }

        // Get createdBy and updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the user course
        const updatedCourse = await prisma.userCourse.update({
          where: {
            id: user_course_id,
          },
          data: {
            names,
            ...updated_by,
          },
        });

        // Return the updated user course
        return res.status(200).json({ data: updatedCourse });
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
