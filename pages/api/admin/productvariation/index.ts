import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

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
                currency: true,
                price: true,
              },
            },
          },
        });

        // Return the product variations
        return res.status(200).json({ data: productVariation });
      }

      case "POST": {
        // Create a new product variations
        const { name, is_downloadable, description, options } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["name", "is_downloadable", "options"],
            "body"
          )
        ) {
          return;
        }

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
              description,
              name,
              is_downloadable,
              ...created_by,
              ...updated_by,
            },
          });

          // Create options if provided
          await prisma.productVariationOption.createMany({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: options.map((option: any) => ({
              ...option,
              productVariationId: newProductVariation.id,
              ...created_by,
              ...updated_by,
            })),
          });

          return newProductVariation;
        });

        // Return the newly created product variation
        return res.status(201).json({ data: result });
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
