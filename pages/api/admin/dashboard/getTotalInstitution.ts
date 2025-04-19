import { NextApiRequest, NextApiResponse } from "next";
import { endOfDay, startOfDay } from "date-fns";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        if (
          !validateRequiredFields(req, res, ["from_date", "to_date"], "body")
        ) {
          return;
        }

        const from_date = req.query.from_date as string;
        const to_date = req.query.to_date as string;

        // Fetch users with pagination
        const ordersLength = await prisma.institution.count({
          where: {
            created_at: {
              gte: startOfDay(new Date(from_date)),
              lte: endOfDay(new Date(to_date)),
            },
          },
        });

        // Return the users along with pagination info
        return res.status(200).json({
          data: ordersLength,
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
