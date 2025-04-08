"use server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "";
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string } }
  | { failure: string; success?: undefined }
>;

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];

const maxFileSize = 1048576 * 10; // 1 MB

type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  checksum: string;
  key: string;
};
export async function getSignedURL({
  fileType,
  fileSize,
  checksum,
  key,
}: GetSignedURLParams): SignedURLResponse {
  const session = await auth();

  if (!session) {
    return { failure: "not authenticated" };
  }

  // first just make sure in our code that we're only allowing the file types we want
  if (!allowedFileTypes.includes(fileType)) {
    return { failure: "File type not allowed" };
  }

  if (fileSize > maxFileSize) {
    return { failure: "File size too large" };
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    // Let's also add some metadata which is stored in s3.
  });

  const url = await getSignedUrl(
    s3Client,
    putObjectCommand,
    { expiresIn: 60 } // 60 seconds
  );

  return { success: { url } };

  // ...
}
