import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "./ApiError.js";
import mime from "mime";

const s3client = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
     },
});

export async function handleS3Upload(file) {
     try {
          if (!file) {
               throw new Error("Please provide a file to upload to S3");
          }

          const fileExtension = file.originalname.split(".").pop();
          if (!fileExtension) {
               throw new Error("Invalid file type");
          }

          const fileBuffer = Buffer.from(await file.buffer);

          const contentType = mime.getType(fileExtension);
          if (!contentType) {
               throw new Error("Invalid content type");
          }

          const params = {
               Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
               Key: `${Date.now()}-${Math.ceil(Math.random() * 1000)}.${fileExtension}`,
               Body: fileBuffer,
               ContentType: contentType,
          };

          const command = new PutObjectCommand(params);
          await s3client.send(command);

          const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
          console.log("imageUrl :: ", imageUrl);

          return imageUrl;
     } catch (error) {
          console.error("Error while processing image upload:", error);
          throw new ApiError(500, "Error while uploading image");
     }
}
