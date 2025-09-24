// config/s3.ts
//creates aws sdk v3 client
//works with aws s3 or any s3 compatible endpoint (MinIO) using S3_ENDPOINT + S3 FORCE_PATH_STYLE.
//controllers import s3 and send PutObjectCommand/DeleteObjectCommand.
import { S3Client } from '@aws-sdk/client-s3';
const { S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_FORCE_PATH_STYLE } = process.env as any;


export const s3 = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    forcePathStyle: S3_FORCE_PATH_STYLE === 'true',
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY }
});