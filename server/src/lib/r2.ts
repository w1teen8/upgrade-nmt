import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2AccessKeyId,
    secretAccessKey: env.r2SecretAccessKey,
  },
});

function guessContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function publicUrlForKey(key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${env.r2PublicUrl}/${encodedKey}`;
}

export async function uploadToR2(key: string, body: Buffer, filename: string): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Body: body,
      ContentType: guessContentType(filename),
    })
  );
  return publicUrlForKey(key);
}
