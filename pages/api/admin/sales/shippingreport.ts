import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

// API handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const from_date = req.query.from_date as string;
        const to_date = req.query.to_date as string;

        const where: Prisma.OrderCartWhereInput = {
          ...(from_date && from_date !== "" && to_date && to_date !== ""
            ? {
                created_at: {
                  gte: startOfDay(new Date(from_date)),
                  lte: endOfDay(new Date(to_date)),
                },
              }
            : {}),
          ...(from_date && from_date !== "" && (!to_date || to_date === "")
            ? {
                created_at: {
                  gte: startOfDay(new Date(from_date)),
                },
              }
            : {}),

          ...(to_date && to_date !== "" && (!from_date || from_date === "")
            ? {
                created_at: {
                  lte: startOfDay(new Date(to_date)),
                },
              }
            : {}),
        };

        // Fetch users with pagination
        const orders = await prisma.orderCart.findMany({
          where: {
            ...where,
            order: { status: "COMPLETED" },
          },
          include: {
            order: {
              select: {
                id: true,
                order_no: true,
                price: true,
                cust_email: true,
                cust_name: true,
                cust_phone: true,
                shipment_method: true,
                shipping_fee: true,
                shipping_address: true,
                tracking_no: true,
                remark: true,
              },
            },
          },
        });

        // Return the users along with pagination info
        return res.status(200).json({
          data: orders,
        });
      }
      default: {
        // Handle unsupported methods
        if (handleAllowedMethods(req, res, ["GET"])) return;
      }
    }
  } catch (error) {
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
