import { NextApiRequest, NextApiResponse } from "next";
import { S3 } from "aws-sdk";

//*helpers
import {
  handleAllowedMethods,
  validateRequiredFields,
} from "@/helpers/apiHelpers";

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
      case "GET": {
        const { fileKey } = req.query;

        // Validate required fields
        if (!validateRequiredFields(req, res, ["fileKey"], "query")) {
          return;
        }

        const url = await getPresignedUrl(
          process.env.BUCKET_NAME || "",
          fileKey as string
        );
        return res.status(200).json({ data: { url } });
      }
      default:
        if (handleAllowedMethods(req, res, ["GET"])) return;
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  }
}

// Generates a secure, time-limited URL for downloading the specified file from S3
export function getPresignedUrl(
  bucketName: string,
  fileKey: string,
  expiresInSeconds = 120
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = fileKey.split("/").pop();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      Bucket: bucketName,
      Key: fileKey,
      Expires: expiresInSeconds,
    };
    params.ResponseContentDisposition = `attachment; filename="${fileName}"`;
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        return reject(err);
      }
      resolve(url);
    });
  });
}
