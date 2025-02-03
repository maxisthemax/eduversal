import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        // Update an existing product type
        const { productVariationId } = req.query;

        // Validate required fields
        if (
          !validateRequiredFields(req, res, ["productVariationId"], "query")
        ) {
          return;
        }

        // Update an existing product type
        const { name, description, is_downloadable, options } = req.body;

        // Get updatedBy
        const { updated_by, created_by } = await getCreatedByUpdatedBy(
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
            } else
              await prisma.productVariationOption.upsert({
                where: { id: option?.id ?? "" },
                create: {
                  ...option,
                  productVariationId: productVariationId,
                  ...updated_by,
                  ...created_by,
                },
                update: {
                  ...option,
                  ...updated_by,
                },
              });
          }

          // Update the product type
          const updatedProductType = await prisma.productVariation.update({
            where: { id: productVariationId as string },
            data: {
              name,
              description,
              is_downloadable,
              ...updated_by,
            },
          });

          return updatedProductType;
        });

        // Return the updated product type
        return res.status(200).json({ data: result });
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
