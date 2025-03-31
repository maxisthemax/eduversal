import { getSession, handleAllowedMethods } from "@/helpers/apiHelpers";
import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation

  const session = await getSession(req, res);
  if (!session?.id)
    return res.status(429).json({
      message: "User is signed out",
      type: "USER_SIGNED_OUT",
    });

  try {
    switch (req.method) {
      case "GET": {
        // Fetch user by ID
        const user = await prisma.user.findUnique({
          where: { id: session.id },
          select: {
            id: true,
            email: true,
            role: true,
            first_name: true,
            last_name: true,
            country_code: true,
            phone_no: true,
            updated_at: true,
            address_1: true,
            address_2: true,
            city: true,
            state: true,
            postcode: true,
            download_images: true,
            is_disabled: true,
            permissions: true,
          },
        });

        // Create a session and store user data
        session.id = user.id;
        session.email = user.email;
        session.role = user.role;
        session.name = user.last_name + " " + user.first_name;
        session.isLoggedIn = true;
        await session.save();

        // Check if the user exists
        if (!user) {
          session.destroy();
          return res
            .status(404)
            .json({ message: "User not found", type: "USER_NOT_FOUND" });
        }

        // Return the user data
        return res.status(200).json({ data: user });
      }

      case "POST": {
        //create new order
        const {
          first_name,
          last_name,
          email,
          country_code,
          phone_no,
          address_1,
          address_2,
          postcode,
          state,
          city,
        } = req.body;

        // Create the new product type

        await prisma.user.update({
          where: {
            id: session.id,
          },
          data: {
            first_name,
            last_name,
            email,
            country_code,
            phone_no,
            address_1,
            address_2,
            postcode,
            state,
            city,
          },
        });

        // Return the newly created product type
        return res.status(201).json({ message: "Success" });
      }

      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET", "POST"])) return;
      }
    }
  } catch (error) {
    switch (error.code) {
      case "P2002":
        // Handle duplicate field error
        return res.status(500).json({
          message: `Duplicate field: ${error.meta.target.join(", ")}`,
          error,
        });
      default:
        break;
    }
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
