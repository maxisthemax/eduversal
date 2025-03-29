import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

export default async function productTypeHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT": {
        // Update an existing product type
        const { productTypeId } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["productTypeId"], "query")) {
          return;
        }

        // Update an existing product type
        const { name, type, currency, price, is_deliverable } = req.body;

        // Get updatedBy
        const { updated_by } = await getCreatedByUpdatedBy(req, res);

        // Update the product type
        const updatedProductType = await prisma.productType.update({
          where: { id: productTypeId as string },
          data: {
            name,
            type,
            currency,
            price,
            is_deliverable,
            ...updated_by,
          },
        });

        // Return the updated product type
        return res.status(200).json({ data: updatedProductType });
      }

      case "DELETE": {
        // Delete an existing product type
        const { productTypeId } = req.query;
        // Validate required fields
        if (!validateRequiredFields(req, res, ["productTypeId"], "query")) {
          return;
        }

        const albumFind = await prisma.album.findMany({
          where: { product_type_id: productTypeId as string },
        });

        if (albumFind.length > 0) {
          return res.status(400).json({
            message: `Cannot delete this product type. ${albumFind
              .map(({ name }) => {
                return name;
              })
              .join(", ")} still using this product type.`,
          });
        }

        // Delete the product type
        await prisma.productType.delete({
          where: { id: productTypeId as string },
        });

        // Return the deleted product type
        return res
          .status(200)
          .json({ message: "Product type deleted successfully" });
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
