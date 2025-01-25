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
        // Fetch all product typess ordered by name in ascending order
        const productType = await prisma.productType.findMany({
          orderBy: { name: "asc" },
        });

        // Return the product types
        return res.status(200).json({ data: productType });
      }

      case "POST": {
        // Create a new product type
        const { name, type, currency, price, is_deliverable } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            ["name", "type", "currency", "price", "is_deliverable"],
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

        // Create the new product type
        const newProductType = await prisma.productType.create({
          data: {
            name,
            type,
            currency,
            price,
            is_deliverable,
            ...created_by,
            ...updated_by,
          },
        });

        // Return the newly created product type
        return res.status(201).json({ data: newProductType });
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
