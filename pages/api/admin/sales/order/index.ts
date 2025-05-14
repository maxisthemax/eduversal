import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

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
        const { page = 0, pageSize = 10 } = req.query;
        const order_no = req.query.order_no as string;
        const cust_name = req.query.cust_name as string;
        const cust_phone = req.query.cust_phone as string;
        const tracking_no = req.query.tracking_no as string;
        const transaction_no = req.query.transaction_no as string;
        const from_date = req.query.from_date as string;
        const to_date = req.query.to_date as string;

        const where: Prisma.OrderWhereInput = {
          ...(order_no && order_no !== ""
            ? {
                order_no: { equals: Number(order_no) },
              }
            : {}),
          ...(cust_name && cust_name !== ""
            ? {
                cust_name: { contains: cust_name, mode: "insensitive" },
              }
            : {}),
          ...(cust_phone && cust_phone !== ""
            ? {
                cust_phone: { contains: cust_phone, mode: "insensitive" },
              }
            : {}),
          ...(tracking_no && tracking_no !== ""
            ? {
                tracking_no: { contains: tracking_no, mode: "insensitive" },
              }
            : {}),
          ...(transaction_no && transaction_no !== ""
            ? {
                transaction_no: {
                  contains: transaction_no,
                  mode: "insensitive",
                },
              }
            : {}),
          ...(from_date && from_date !== "" && to_date && to_date !== ""
            ? {
                created_at: {
                  gte: new Date(from_date),
                  lte: new Date(to_date),
                },
              }
            : {}),
          ...(from_date && from_date !== "" && (!to_date || to_date === "")
            ? {
                created_at: {
                  gte: new Date(from_date),
                },
              }
            : {}),

          ...(to_date && to_date !== "" && (!from_date || from_date === "")
            ? {
                created_at: {
                  lte: new Date(to_date),
                },
              }
            : {}),
        };

        // Fetch total count of users
        const totalCount = await prisma.order.count({ where });
        const skip = Number(page) * Number(pageSize);

        // Fetch users with pagination
        const orders = await prisma.order.findMany({
          where,
          orderBy: [
            {
              priority: "desc",
            },
            {
              created_at: "desc",
            },
          ],
          skip,
          take: Number(pageSize),
        });

        // Return the users along with pagination info
        return res.status(200).json({
          data: orders,
          currentPage: Number(page),
          totalCount,
          where,
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
