import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";
import { deleteFile } from "@/pages/api/functions/upload";
import includes from "lodash/includes";

export default async function packageHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        const { packageId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["packageId"], "query")) {
          return;
        }

        // Update an existing package
        const {
          name,
          description,
          price,
          currency,
          is_downloadable,
          preview_url,
          preview_url_key,
          albums,
        } = req.body;
        // Get updatedBy
        const { created_by, updated_by } = await getCreatedByUpdatedBy(
          req,
          res
        );

        // Get the previous package data

        const result = await prisma.$transaction(async (prisma) => {
          const previousPackage = await prisma.package.findUnique({
            where: { id: packageId as string },
            select: { preview_url_key: true },
          });

          const previousPackageAlbum = await prisma.packageAlbum.findMany({
            where: { package_id: packageId as string },
            select: { album_id: true },
          });

          if (
            previousPackage?.preview_url_key !== "" &&
            previousPackage?.preview_url_key !== preview_url_key
          ) {
            await deleteFile([previousPackage.preview_url_key]);
          }

          // Update the package
          const updatedPackage = await prisma.package.update({
            where: { id: packageId as string },
            data: {
              name,
              description,
              price,
              currency,
              is_downloadable,
              preview_url,
              preview_url_key,
              ...updated_by,
            },
          });

          for (const packageAlbum of previousPackageAlbum) {
            if (!includes(albums, { album_id: packageAlbum.album_id })) {
              await prisma.packageAlbum.delete({
                where: {
                  package_id_album_id: {
                    package_id: packageId as string,
                    album_id: packageAlbum.album_id,
                  },
                },
              });
            }

            for (const album of albums) {
              await prisma.packageAlbum.upsert({
                where: {
                  package_id_album_id: {
                    package_id: packageId as string,
                    album_id: album.album_id,
                  },
                },
                create: {
                  package_id: packageId as string,
                  album_id: album.album_id,
                  quantity: album.quantity,
                  ...created_by,
                  ...updated_by,
                },
                update: {
                  quantity: album.quantity,
                  ...updated_by,
                },
              });
            }
          }

          return updatedPackage;
        });

        // Return the updated package
        return res.status(200).json({ data: result });
      }

      case "DELETE": {
        const { packageId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["packageId"], "query")) {
          return;
        }

        // Delete the package

        await prisma.$transaction(async (prisma) => {
          await prisma.packageAlbum.deleteMany({
            where: { package_id: packageId as string },
          });
          await prisma.package.delete({
            where: { id: packageId as string },
          });
        });

        // Return a success message
        return res
          .status(200)
          .json({ message: "Package deleted successfully" });
      }

      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT", "DELETE"])) return;
    }
  } catch (error) {
    // Handle any errors
    if (error.code === "P2002") {
      return res.status(500).json({
        message: `Duplicate field: ${error.meta.target.join(", ")}`,
        error,
      });
    }

    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  } finally {
    // Ensure the Prisma Client disconnects from the database
    await prisma.$disconnect();
  }
}
