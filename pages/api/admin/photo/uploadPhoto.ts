import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import sharp from "sharp";

//*lodash
import isEmpty from "lodash/isEmpty";

//*helpers
import { replaceStringAll } from "@/helpers/stringHelpers";
import { handleAllowedMethods } from "@/helpers/apiHelpers";

//*functions
import { upload } from "../../functions/upload";

// Disable Next.js's built-in body parsing, as we use formidable instead.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST":
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
            download_watermark_url: string;
            display_url: string;
          }[] = [];

          // Get folderPath from form data
          const folderPath = fields.folderPath;
          if (!folderPath) {
            return res.status(400).json({ message: "No folder assigned." });
          }

          const watermark = Array.isArray(fields.watermark)
            ? fields.watermark[0]
            : fields.watermark;
          const addWatermark = watermark === "true";
          console.log(addWatermark);
          const uploadPromises = fileArray.map(async (file) => {
            // Create a readable stream from the file path that formidable provides
            const fileStream = fs.createReadStream(file.filepath);
            const { format, width } = await sharp(file.filepath).metadata();
            let newWidth = width;
            while (newWidth > 500) {
              newWidth *= 0.9; // Reduce width by 50% until it's less than 100px
            }
            const watermarkSvg = createWatermarkSVG("EXAMPLE");
            let transform = sharp(file.filepath).resize(Math.floor(newWidth));

            if (format === "png") {
              // e.g. compressionLevel: 9 is the maximum compression
              transform = transform.png({ quality: 80, compressionLevel: 9 });
            } else if (format === "jpeg") {
              transform = transform.jpeg({ quality: 80 });
            } else if (format === "avif") {
              transform = transform.avif({ quality: 80 });
            } else {
              // fallback: force everything else to JPEG or choose another path
              transform = transform.jpeg({ quality: 80 });
            }
            transform = transform.composite([
              {
                input: Buffer.from(watermarkSvg),
                gravity: "center", // place it bottom-right
              },
            ]);
            const watermarkedAndCompressedBuffer = await transform.toBuffer();

            // Generate a new file name
            const newFileName = replaceStringAll(
              file.originalFilename || file.newFilename,
              " ",
              "-"
            );

            // Upload the original file to S3 (or DO Spaces)
            const originalRes = await upload({
              Key: `${folderPath}/${newFileName}`,
              Body: fileStream,
              ACL: addWatermark ? "private" : "public-read",
              ContentType: file.mimetype,
            });

            const newFileNameWatermark = replaceStringAll(
              `watermark-${file.originalFilename || file.newFilename}`,
              " ",
              "-"
            );

            // Upload the watermark file to S3 (or DO Spaces)
            const watermarkRes = addWatermark
              ? await upload({
                  Key: `${folderPath}/${newFileNameWatermark}`,
                  Body: watermarkedAndCompressedBuffer,
                  ACL: "public-read",
                  ContentType: file.mimetype,
                  Metadata: {
                    "Content-Disposition": "inline",
                  },
                })
              : undefined;

            // Add the URLs to the fileUrls array
            fileUrls.push({
              name: newFileName,
              download_url: `${folderPath}/${newFileName}`,
              download_watermark_url: addWatermark
                ? `${folderPath}/${newFileNameWatermark}`
                : ``,
              display_url: addWatermark
                ? watermarkRes.Location
                : originalRes.Location,
            });
          });

          await Promise.all(uploadPromises);

          return res.status(200).json({
            message: "Files uploaded successfully",
            data: fileUrls,
          });
        });
        break;

      default:
        if (handleAllowedMethods(req, res, ["PUT"])) return;
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Failed to process request",
      error,
    });
  }
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
          fill: rgba(0, 0, 0, 0.8); /* white with 80% opacity */
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
