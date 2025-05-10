import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay, format } from "date-fns";

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

        const fromDate = from_date ? startOfDay(new Date(from_date)) : null;
        const toDate = to_date ? endOfDay(new Date(to_date)) : null;

        const result = await prisma.$queryRaw<
          { date: Date; count: bigint; total: number }[]
        >`
          SELECT DATE_TRUNC('day', "created_at") AS date, COUNT(*) AS count,
                 SUM("price") AS total
          FROM "Order"
          WHERE "status" = 'COMPLETED'
          ${
            fromDate && toDate
              ? Prisma.sql`AND "created_at" BETWEEN ${fromDate} AND ${toDate}`
              : Prisma.empty
          }
          GROUP BY date
          ORDER BY date ASC;
        `;

        const formatted = result.map((r) => ({
          date: format(new Date(r.date), "dd/MM/yyyy"),
          count: Number(r.count), // convert bigint to number
          total: Number(r.total), // convert bigint to number (if SUM is bigint)
        }));
        // Return the users along with pagination info
        return res.status(200).json({
          data: formatted,
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
