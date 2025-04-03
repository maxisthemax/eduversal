import { NextApiRequest, NextApiResponse } from "next";
import { formatDate } from "date-fns";
import crypto from "crypto";
import axios from "axios";

//*lib
import prisma from "@/lib/prisma";

//*helpers
import {
  getCreatedByUpdatedBy,
  getUserId,
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

const eghlPymtMethod = {
  fpx: "DD",
  credit_debit: "CC",
  e_wallet: "WA",
};

const SERVICE_ID = process.env.SERVICE_ID;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;
const MERCHANT_RETURN_URL = `${process.env.NEXT_PUBLIC_URL}/payment`;
const MERCHANT_CALLBACK_URL = `${process.env.NEXT_SERVER_API_URL}/api/payment/callbackPayment`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateHash = (paymentData: any): string => {
  const hashString = `${MERCHANT_PASSWORD}${SERVICE_ID}${paymentData.PaymentID}${MERCHANT_RETURN_URL}${MERCHANT_CALLBACK_URL}${paymentData.Amount}${paymentData.CurrencyCode}${paymentData.CustIP}`;
  return crypto.createHash("sha256").update(hashString).digest("hex");
};

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

        const queryData = await prisma.$transaction(async (prisma) => {
          // Create the new product type
          const newOrder = await prisma.order.create({
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

          const publicIp = await axios.get(
            "https://api64.ipify.org?format=json"
          );

          const queryData = {
            TransactionType: "SALE",
            PymtMethod: eghlPymtMethod[payment_method],
            ServiceID: SERVICE_ID,
            OrderNumber: newOrder.order_no,
            PaymentID: `${newOrder.order_no}_${formatDate(
              new Date(),
              "yyyyMMddHHmmssSS"
            )}`,
            Amount: price.toFixed(2),
            CurrencyCode: "MYR",
            HashValue: generateHash({
              ServiceID: SERVICE_ID,
              PaymentID: `${newOrder.order_no}_${formatDate(
                new Date(),
                "yyyyMMddHHmmssSS"
              )}`,
              Amount: price.toFixed(2),
              CurrencyCode: "MYR",
              CustIP: publicIp.data.ip,
            }),
            MerchantReturnURL: MERCHANT_RETURN_URL,
            MerchantCallBackURL: MERCHANT_CALLBACK_URL,
            CustIP: publicIp.data.ip,
          };

          const paymentData = await prisma.payment.create({
            data: {
              order_id: newOrder.id,
              hashValue: queryData.HashValue,
              request_detail: queryData,
              ...created_by,
              ...updated_by,
            },
          });

          return {
            ...queryData,
            payment_id: paymentData.id,
            order_id: newOrder.id,
          };
        });

        // Return the newly created product type
        return res.status(201).json({ data: queryData });
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
