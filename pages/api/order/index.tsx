import { NextApiRequest, NextApiResponse } from "next";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  getUserId,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserId(req, res);
  try {
    switch (req.method) {
      case "GET": {
        // Fetch courses for the given institutionId and academicYearId
        const courses = await prisma.order.findMany({
          where: {
            user_id: userId,
          },
        });

        // Return the courses
        return res.status(200).json({ data: courses });
      }
      case "POST": {
        //create new order
        const {
          shipping_address,
          cart,
          payment_method,
          shipment_method,
          shipping_fee,
          price,
          remark,
          status,
        } = req.body;

        // Validate required fields
        if (
          !validateRequiredFields(
            req,
            res,
            [
              "shipping_address",
              "cart",
              "payment_method",
              "shipment_method",
              "shipping_fee",
              "price",
              "status",
            ],
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
        const newProductType = await prisma.order.create({
          data: {
            shipping_address,
            cart,
            payment_method,
            shipment_method,
            shipping_fee,
            user_id: userId,
            price,
            remark,
            status,
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
