import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getInstitutions(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch all institutions with their types
    const institutions = await prisma.institution.findMany({
      include: {
        type: true,
      },
    });

    // Return the institutions
    return res.status(200).json({ institutions });
  } catch (error) {
    // Handle any errors
    return res
      .status(500)
      .json({ message: "Failed to fetch institutions", error });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
