import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
} from "@/helpers/apiHelpers";
import { upload } from "../../functions/upload";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(req.method);
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
          // if (err) {
          //   return res
          //     .status(400)
          //     .json({ message: "Failed to parse form data", error: err });
          // }

          // const { name, is_downloadable, description } = fields;
          // const parseOptions = JSON.parse(fields.options[0] as string);

          // const options = parseOptions.map((option, index) => {
          //   return {
          //     ...option,
          //     preview_image: files[`options[${index}][preview_image]`][0],
          //   };
          // });

          // // Get createdBy and updatedBy
          // const { created_by, updated_by } = await getCreatedByUpdatedBy(
          //   req,
          //   res
          // );

          // // Start a transaction
          // // const result = await prisma.$transaction(async (prisma) => {
          // //   // Create the new product variation
          // //   const newProductVariation = await prisma.productVariation.create({
          // //     data: {
          // //       description: description[0] as string,
          // //       name: name[0] as string,
          // //       is_downloadable: is_downloadable[0] === "true", // Convert to boolean
          // //       ...created_by,
          // //       ...updated_by,
          // //     },
          // //   });

          // //   // Loop through the options and upload the preview_image
          // //   for (const option of options) {
          // //     if (option.preview_image) {
          // //       // Upload the preview image to your storage (e.g., AWS S3, Google Cloud Storage)
          // //       // Assuming you have a function `uploadImage` that handles the upload
          // //       const res = await upload({
          // //         Key: `product-variation/${newProductVariation.id}/option/${option.id}/${option.preview_image.name}`,
          // //         Body: option.preview_image,
          // //         ACL: "public-read",
          // //         ContentType: option.preview_image.mimetype,
          // //         Metadata: {
          // //           "Content-Disposition": "inline",
          // //         },
          // //       });
          // //       option.preview_url = res.Location;
          // //       await prisma.productVariationOption.create({
          // //         data: {
          // //           ...option,
          // //           productVariationId: newProductVariation.id,
          // //           ...created_by,
          // //           ...updated_by,
          // //         },
          // //       });
          // //     }
          // //   }

          // //   return newProductVariation;
          // // });

          // // Return the newly created product variation
          return res.status(201).json({ data: "" });
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
