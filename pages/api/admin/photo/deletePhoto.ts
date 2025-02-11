import { NextApiRequest, NextApiResponse } from "next";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";
import { deleteFile } from "../../functions/upload";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST": {
        const { keys } = req.body;

        // Basic validation
        if (!keys || !Array.isArray(keys) || keys.length === 0) {
          return res.status(400).json({ message: "No photo keys provided." });
        }

        const deleteResult = await deleteFile(keys);

        return res.status(200).json({
          message: "Files deleted successfully",
          data: deleteResult,
        });
      }
      default:
        if (handleAllowedMethods(req, res, ["POST"])) return;
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  }
}
