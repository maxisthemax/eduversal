import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import { S3 } from "aws-sdk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

//*lodash
import isEmpty from "lodash/isEmpty";

//*helpers
import { replaceStringAll } from "@/helpers/stringHelpers";

// Disable Next.js's built-in body parsing, as we use formidable instead.
export const config = {
  api: {
    bodyParser: false,
  },
};

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
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed. Only POST is supported.",
    });
  }

  // Parse the incoming form data using formidable
  const form = formidable({ multiples: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (isEmpty(files)) {
      return res.status(400).json({
        message: "Files Empty",
      });
    }

    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Error parsing the file" });
    }

    const uploadedFiles = files.files;

    if (!uploadedFiles) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // Ensure uploadedFiles is an array
    const fileArray = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];
    const fileUrls: {
      name: string;
      download_url: string;
      display_url: string;
    }[] = [];

    // Get folderPath from form data
    const folderPath = fields.folderPath;
    if (!folderPath) {
      return res.status(400).json({ message: "No folder assigned." });
    }

    try {
      const uploadPromises = fileArray.map(async (file) => {
        // Create a readable stream from the file path that formidable provides
        const fileStream = fs.createReadStream(file.filepath);
        const { format } = await sharp(file.filepath).metadata();
        const watermarkSvg = createWatermarkSVG("EXAMPLE");
        let transform = sharp(file.filepath).composite([
          {
            input: Buffer.from(watermarkSvg),
            gravity: "center", // place it bottom-right
          },
        ]);

        if (format === "png") {
          // e.g. compressionLevel: 9 is the maximum compression
          transform = transform.png({ quality: 40, compressionLevel: 9 });
        } else if (format === "jpeg") {
          transform = transform.jpeg({ quality: 40 });
        } else if (format === "avif") {
          transform = transform.avif({ quality: 40 });
        } else {
          // fallback: force everything else to JPEG or choose another path
          transform = transform.jpeg({ quality: 40 });
        }
        const watermarkedAndCompressedBuffer = await transform.toBuffer();

        // Generate a new file name
        const newFileName = `${Date.now()}-${uuidv4().slice(0, 4)}-${
          file.originalFilename || file.newFilename
        }`;

        // Upload parameters for the original file
        const uploadParams: S3.PutObjectRequest = {
          Bucket: process.env.BUCKET_NAME || "",
          Key: replaceStringAll(`${folderPath}/${newFileName}`, " ", "-"),
          Body: fileStream,
          ACL: "private",
        };

        // Upload the original file to S3 (or DO Spaces)
        await s3.upload(uploadParams).promise();

        const newFileNameWatermark = `${Date.now()}-${uuidv4().slice(
          0,
          4
        )}-watermark-${file.originalFilename || file.newFilename}`;

        // Upload parameters for the watermark file
        const uploadParams_watermark: S3.PutObjectRequest = {
          Bucket: process.env.BUCKET_NAME || "",
          Key: replaceStringAll(
            `${folderPath}/${newFileNameWatermark}`,
            " ",
            "-"
          ),
          Body: watermarkedAndCompressedBuffer,
          ACL: "public-read",
        };

        // Upload the watermark file to S3 (or DO Spaces)
        const res = await s3.upload(uploadParams_watermark).promise();

        // Add the URLs to the fileUrls array
        fileUrls.push({
          name: newFileName,
          download_url: `${folderPath}/${newFileName}`,
          display_url: res.Location,
        });
      });

      await Promise.all(uploadPromises);

      return res.status(200).json({
        message: "Files uploaded successfully",
        data: fileUrls,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message ? error.message : "Failed to process request",
        error,
      });
    }
  });
}

export function getPresignedUrl(
  bucketName: string,
  fileKey: string,
  expiresInSeconds = 60
): Promise<string> {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Expires: expiresInSeconds, // link expiration in seconds
    };

    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        return reject(err);
      }
      resolve(url);
    });
  });
}

function createWatermarkSVG(text: string) {
  // Example: a 400x100 SVG with black text (24px font) and some styling
  // If you don't know the text length or want auto sizing, you can
  // measure text or set 'width="100%" height="100%"', etc.
  return `
    <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
      <style>
        .watermark {
          font-family: Arial, sans-serif;
          font-size: 60px;
          fill: rgba(255, 255, 255, 1); /* white with 80% opacity */
          font-weight: bold;
        }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="watermark">
        ${escapeForSVG(text)}
      </text>
    </svg>
  `;
}

function escapeForSVG(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
