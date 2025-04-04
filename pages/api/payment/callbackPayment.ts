import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const { PaymentID, Amount, CurrencyCode } = req.body;
  try {
    //const response = await axios.post(EGH_URL, queryData);
    res.json({ data: req.body });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
