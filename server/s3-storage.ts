import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Selectel S3 configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'ru-7',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.ru-7.storage.selcloud.ru',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false, // Use vHosted style for Selectel
});

const BUCKET_NAME = process.env.S3_BUCKET || 'santa';

export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed - bucket is public
  });

  await s3Client.send(command);

  // Return public URL for Selectel S3
  const region = process.env.S3_REGION || 'ru-7';
  const publicUrl = `https://${BUCKET_NAME}.${region}.storage.selcloud.ru/${key}`;
  return publicUrl;
}
