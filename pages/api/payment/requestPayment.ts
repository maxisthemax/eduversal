import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";
import prisma from "@/lib/prisma";
import { getCreatedByUpdatedBy } from "@/helpers/apiHelpers";

const SERVICE_ID = process.env.SERVICE_ID;
const MERCHANT_PASSWORD = process.env.MERCHANT_PASSWORD;
const MERCHANT_RETURN_URL = `${process.env.NEXT_PUBLIC_URL}/payment`;
const MERCHANT_CALLBACK_URL = `${process.env.NEXT_SERVER_API_URL}/api/payment/callbackPayment`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateHash = (paymentData: any): string => {
  const hashString = `${MERCHANT_PASSWORD}${SERVICE_ID}${paymentData.PaymentID}${MERCHANT_RETURN_URL}${MERCHANT_CALLBACK_URL}${paymentData.Amount}${paymentData.CurrencyCode}${paymentData.CustIP}`;
  return crypto.createHash("sha256").update(hashString).digest("hex");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const publicIp = await axios.get("https://api64.ipify.org?format=json");

    const { PymtMethod, OrderNumber, PaymentID, Amount, CurrencyCode } =
      req.body;

    const queryData = {
      TransactionType: "SALE",
      PymtMethod,
      ServiceID: SERVICE_ID,
      OrderNumber,
      PaymentID,
      Amount,
      CurrencyCode,
      HashValue: generateHash({
        ServiceID: SERVICE_ID,
        PaymentID,
        Amount,
        CurrencyCode,
        CustIP: publicIp.data.ip,
      }),
      MerchantReturnURL: MERCHANT_RETURN_URL,
      MerchantCallBackURL: MERCHANT_CALLBACK_URL,
      CustIP: publicIp.data.ip,
    };
    const { created_by, updated_by } = await getCreatedByUpdatedBy(req, res);

    const orderData = await prisma.order.findFirst({
      where: {
        order_no: OrderNumber,
      },
    });

    await prisma.payment.create({
      data: {
        payment_id: queryData.PaymentID,
        order_id: orderData.id,
        hashValue: queryData.HashValue,
        request_detail: queryData,
        ...created_by,
        ...updated_by,
      },
    });

    return res.status(201).json({ data: queryData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
