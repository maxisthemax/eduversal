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
        // Fetch all users ordered by name in ascending order
        const users = await prisma.user.findMany({
          where: {
            role: "ADMIN",
          },
          orderBy: { first_name: "asc" },
        });

        // Return the users
        return res.status(200).json({ data: users });
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
