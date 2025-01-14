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
        const { page = 0, pageSize = 10 } = req.query;
        const skip = Number(page) * Number(pageSize);

        // Fetch total count of users
        const totalCount = await prisma.user.count({
          where: {
            role: "USER",
          },
        });

        // Fetch users with pagination
        const users = await prisma.user.findMany({
          where: {
            role: "USER",
          },
          orderBy: { first_name: "asc" },
          skip,
          take: Number(pageSize),
        });

        // Return the users along with pagination info
        return res.status(200).json({
          data: users,
          currentPage: Number(page),
          totalCount,
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
