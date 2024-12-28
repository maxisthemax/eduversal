import { getSession, handleAllowedMethods } from "@/helpers/apiHelpers";
import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

export default async function getUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["GET"])) return;

  const session = await getSession(req, res);
  if (!session?.id)
    return res.status(429).json({
      message: "User is signed out",
      type: "USER_SIGNED_OUT",
    });

  try {
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
      },
    });

    // Create a session and store user data
    session.id = user.id;
    session.email = user.email;
    session.role = user.role;
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
  } catch (error) {
    session.destroy();
    // Handle any errors
    return res.status(500).json({
      message: "Failed to fetch user data",
      error,
      type: "FAILED_TO_FETCH_USER_DATA",
    });
  }
}
