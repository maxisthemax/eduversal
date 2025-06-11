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
} from "@/helpers/apiHelpers";

//*functions
import { upload } from "../../functions/upload";

//*helpers
import { replaceStringAll } from "@/helpers/stringHelpers";

// Disable Next.js's built-in body parsing, as we use formidable instead.
export const config = {
  api: {
    bodyParser: false,
  },
};

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        // Fetch all product variations ordered by name in ascending order
        const productVariation = await prisma.productVariation.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            is_downloadable: true,
            created_at: true,
            updated_at: true,
            options: {
              select: {
                id: true,
                name: true,
                description: true,
                preview_url: true,
                preview_url_key: true,
                currency: true,
                price: true,
              },
            },
          },
        });

        // Return the product variations
        return res.status(200).json({ data: productVariation });
      }

      case "POST":
        // Create a new product variations
        // Parse form data using formidable
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
            // Create the new product variation
            const newProductVariation = await prisma.productVariation.create({
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
                ...updated_by,
              },
            });

            // Loop through the options and upload the preview_image
            for (const option of options) {
              if (option.preview_image) {
                // Upload the preview image to your storage (e.g., AWS S3, Google Cloud Storage)
                // Assuming you have a function `uploadImage` that handles the upload
                const fileStream = fs.createReadStream(
                  option.preview_image.filepath
                );
                const newFileName = replaceStringAll(
                  option.preview_image.originalFilename ||
                    option.preview_image.newFilename,
                  " ",
                  "-"
                );
                const res = await upload({
                  Key: `productVariation/${newProductVariation.id}/${newFileName}`,
                  Body: fileStream,
                  ACL: "public-read",
                  ContentType: option.preview_image.mimetype,
                });
                option.preview_url = res.Location;
                option.preview_url_key = res.Key;
              }
              await prisma.productVariationOption.create({
                data: {
                  name: option.name,
                  description: option.description,
                  preview_url: option?.preview_url ?? "",
                  preview_url_key: option?.preview_url_key ?? "",
                  currency: option.currency,
                  price: parseFloat(option.price),
                  productVariation_id: newProductVariation.id,
                  ...created_by,
                  ...updated_by,
                },
              });
            }

            return newProductVariation;
          });

          // Return the newly created product variation
          return res.status(201).json({ data: result });
        });
        break;

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

// Disable body parsing for the API route
