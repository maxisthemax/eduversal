import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const institutionId = req.query.institutionId as string;
        const academicYearId = req.query.academicYearId as string;
        const courseId = req.query.courseId as string;
        const standardId = req.query.standardId as string;

        // Fetch users with pagination
        const orders = await prisma.orderCart.findMany({
          where: {
            institutionId: institutionId,
            academicYearId: academicYearId,
            standardId: standardId,
            courseId: courseId,
            order: { status: "COMPLETED" },
          },
          orderBy: [
            {
              created_at: "asc",
            },
          ],
          include: {
            order: { select: { id: true, order_no: true, remark: true } },
          },
        });

        // Return the users along with pagination info
        return res.status(200).json({
          data: orders,
        });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET"])) return;
      }
    }
  } catch (error) {
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
