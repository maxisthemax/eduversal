import { getSession, handleAllowedMethods } from "@/helpers/apiHelpers";
import { NextApiRequest, NextApiResponse } from "next";

//*lodash
import uniqBy from "lodash/uniqBy";

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
      case "POST": {
        //create new order
        const { download_images } = req.body;

        // Create the new product type
        const user = await prisma.user.findUnique({
          where: { id: session.id },
          select: {
            download_images: true,
          },
        });
        const userDownloadImage = user.download_images
          ? (user.download_images as {
              photoUrl: string;
              photoId: string;
              downloadUrl: string;
            }[])
          : [];

        await prisma.user.update({
          where: {
            id: session.id,
          },
          data: {
            download_images: uniqBy(
              [...userDownloadImage, ...download_images],
              "photoId"
            ),
          },
        });

        // Return the newly created product type
        return res.status(201).json({ message: "Success" });
      }

      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["POST"])) return;
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
