/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3 } from "aws-sdk";

// Validate environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.AWS_REGION;
const bucketName = process.env.BUCKET_NAME;

if (!accessKeyId || !secretAccessKey || !endpoint || !region || !bucketName) {
  console.error("Missing required environment variables for S3 configuration.");
  throw new Error(
    "Missing required environment variables for S3 configuration."
  );
}

const s3 = new S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  endpoint: endpoint,
  region: region,
  s3ForcePathStyle: false,
  signatureVersion: "v4",
});

export async function upload(options: {
  Key: string;
  Body: S3.Body;
  ACL: "public-read" | "private";
  ContentType: string;
  Metadata?: S3.Metadata;
}): Promise<S3.ManagedUpload.SendData | undefined> {
  try {
    const uploadParams: S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: options.Key,
      Body: options.Body,
      ACL: options.ACL,
      ContentType: options.ContentType,
      Metadata: options.Metadata,
    };
    const res = await s3.upload(uploadParams).promise();
    console.log("File uploaded successfully:", res.Location);
    return res;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw new Error(error);
  }
}

export async function deleteFile(
  keys: string[]
): Promise<S3.DeleteObjectsOutput> {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error("Keys must be a non-empty array.");
    }

    const deleteParams: S3.DeleteObjectsRequest = {
      Bucket: bucketName,
      Delete: { Objects: keys.map((key: string) => ({ Key: key })) },
    };

    const res = await s3.deleteObjects(deleteParams).promise();
    console.log("Files deleted successfully:", keys);
    return res;
  } catch (error: any) {
    console.error("Error deleting files:", error);
    throw new Error(error);
  }
}
