import { NextApiRequest, NextApiResponse } from "next";
import { S3 } from "aws-sdk";

//*helpers
import { handleAllowedMethods } from "@/helpers/apiHelpers";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.AWS_REGION,
  s3ForcePathStyle: false,
  signatureVersion: "v4",
});

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

        const deleteParams: S3.DeleteObjectsRequest = {
          Bucket: process.env.BUCKET_NAME || "",
          Delete: { Objects: keys.map((key: string) => ({ Key: key })) },
        };

        // Perform bulk deletion
        const deleteResult = await s3.deleteObjects(deleteParams).promise();

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
