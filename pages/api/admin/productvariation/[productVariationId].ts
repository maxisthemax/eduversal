import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import formidable from "formidable";

//*lodash
import isArray from "lodash/isArray";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

//*functions
import { deleteFile, upload } from "../../functions/upload";

// Disable Next.js's built-in body parsing, as we use formidable instead.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT":
        // Update an existing product type
        const { productVariationId } = req.query;

        const form = formidable({ multiples: true });
        form.parse(req, async (err, fields, files) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "Failed to parse form data", error: err });
          }

          const { name, is_downloadable, description } = fields;

          const parseOptions = JSON.parse(
            (isArray(fields.options)
              ? fields.options[0]
              : fields.options) as string
          );

          const options = parseOptions.map((option, index) => {
            return {
              ...option,
              preview_image:
                files?.[`options[${index}][preview_image]`]?.[0] ?? null,
            };
          });

          // Get createdBy and updatedBy
          const { created_by, updated_by } = await getCreatedByUpdatedBy(
            req,
            res
          );

          // Start a transaction
          const result = await prisma.$transaction(async (prisma) => {
            for (const option of options) {
              if (option.status === "deleted") {
                await prisma.productVariationOption.delete({
                  where: { id: option.id },
                });
                await deleteFile([option.preview_url_key]);
              } else {
                if (option.preview_image) {
                  // Upload the preview image to your storage (e.g., AWS S3, Google Cloud Storage)
                  // Assuming you have a function `uploadImage` that handles the upload
                  const fileStream = fs.createReadStream(
                    option.preview_image.filepath
                  );
                  const res = await upload({
                    Key: `productVariation/${productVariationId as string}/${
                      option.preview_image.newFilename
                    }`,
                    Body: fileStream,
                    ACL: "public-read",
                    ContentType: option.preview_image.mimetype,
                  });
                  option.preview_url = res.Location;
                  option.preview_url_key = res.Key;
                }

                await prisma.productVariationOption.upsert({
                  where: { id: option?.id ?? "" },
                  create: {
                    name: option.name,
                    description: option.description,
                    preview_url: option.preview_url,
                    preview_url_key: option.preview_url_key,
                    currency: option.currency,
                    price: parseFloat(option.price),
                    productVariation_id: productVariationId as string,
                    ...created_by,
                    ...updated_by,
                  },
                  update: {
                    name: option.name,
                    description: option.description,
                    preview_url: option.preview_url,
                    preview_url_key: option.preview_url_key,
                    currency: option.currency,
                    price: parseFloat(option.price),
                    ...updated_by,
                  },
                });
              }
            }

            const updatedProductType = await prisma.productVariation.update({
              where: { id: productVariationId as string },
              data: {
                description: (isArray(description)
                  ? description[0]
                  : description) as string,
                name: (isArray(name) ? name[0] : name) as string,
                is_downloadable:
                  (isArray(is_downloadable)
                    ? is_downloadable[0]
                    : is_downloadable) === "true", // Convert to boolean
                ...created_by,
              },
            });

            return updatedProductType;
          });

          return res.status(200).json({ data: result });
        });
        break;
      case "DELETE": {
        // Delete a product type
        const { productVariationId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, ["productVariationId"], "query")
        ) {
          return;
        }

        const albumProductFound = await prisma.albumProductVariation.findMany({
          where: { productVariation_id: productVariationId as string },
          include: { album: { select: { name: true } } },
        });

        if (albumProductFound.length > 0) {
          return res.status(400).json({
            message: `Cannot delete this product variation type. ${albumProductFound
              .map(({ album }) => {
                return album.name;
              })
              .join(", ")} still using this product variation type.`,
          });
        }

        // Delete the product type
        await prisma.$transaction(async (prisma) => {
          await prisma.productVariationOption.deleteMany({
            where: { productVariation_id: productVariationId as string },
          });

          await prisma.productVariation.delete({
            where: { id: productVariationId as string },
          });
        });

        // Return the deleted product type
        return res
          .status(200)
          .json({ message: "Product variation type deleted successfully" });
      }
      default:
        // Use handleAllowedMethods for method validation
        if (handleAllowedMethods(req, res, ["PUT"])) return;
    }
  } catch (error) {
    // Handle any errors
    switch (error.code) {
      case "P2002":
        return res.status(500).json({
          message: `Duplicate field: ${error.meta.target.join(", ")}`,
          error,
        });

      default:
        break;
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
