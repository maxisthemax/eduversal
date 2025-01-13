import { NextApiRequest, NextApiResponse } from "next";

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
      case "POST": {
        // Extract name from request body
        const { userId, email, role } = req.body;

        // Validate required fields in request body
        if (!validateRequiredFields(req, res, ["role"])) {
          return;
        }

        if (!userId && !email) {
          return res
            .status(400)
            .json({ message: "userId or email is required" });
        }
        // Find the user by userId or email
        const user = await prisma.user.findUnique({
          where: userId ? { id: userId } : { email: email },
        });

        // If no user is found, return an error
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update the user role
        const updatedUser = await prisma.user.update({
          where: userId ? { id: userId } : { email: email },
          data: { role },
        });

        return res.status(201).json({ data: updatedUser });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
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
