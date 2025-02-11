import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.AWS_REGION,
  s3ForcePathStyle: false,
  signatureVersion: "v4",
});

export async function upload(options: {
  Key: string;
  Body: S3.Body;
  ACL: "public-read" | "private";
  ContentType: string;
  Metadata?: S3.Metadata;
}): Promise<S3.ManagedUpload.SendData> {
  const uploadParams: S3.PutObjectRequest = {
    Bucket: process.env.BUCKET_NAME || "",
    Key: options.Key,
    Body: options.Body,
    ACL: options.ACL,
    ContentType: options.ContentType,
    Metadata: options.Metadata,
  };
  const res = await s3.upload(uploadParams).promise();
  return res;
}

export async function deleteFile(keys: string[]) {
  const deleteParams: S3.DeleteObjectsRequest = {
    Bucket: process.env.BUCKET_NAME || "",
    Delete: { Objects: keys.map((key: string) => ({ Key: key })) },
  };

  // Perform bulk deletion
  return await s3.deleteObjects(deleteParams).promise();
}
