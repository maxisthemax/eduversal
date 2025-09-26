import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";

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

          const uploadPromises = fileArray.map(async (file) => {
            const fileStream = fs.createReadStream(file.filepath);
            let watermarkedBuffer: Buffer | undefined;

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
                  Body: watermarkedBuffer,
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
