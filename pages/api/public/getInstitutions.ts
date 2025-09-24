import { NextApiRequest, NextApiResponse } from "next";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

//*lib
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        // Fetch all institutions with their types
        const institutions = await prisma.institution.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });

        // Return the institutions
        return res.status(200).json({ data: institutions });
      }

      default:
        if (handleAllowedMethods(req, res, ["GET"])) return;
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  }
}
