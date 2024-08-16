import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import dotenv from 'dotenv';

import matter from 'gray-matter';
import sharp from 'sharp';
import fs from 'fs';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class S3 {
  public static async addToS3(
    tableName: string,
    metadata: any,
    body: string
  ): Promise<boolean> {
    try {
      const markdownString = matter.stringify(body, metadata);
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const objectKey = `${tableName}/${metadata.ID}.md`;

      // Temporary for local import purposes
      fs.writeFileSync(
        `src/assets/${tableName}/${metadata.ID}.md`,
        markdownString,
        'utf8'
      );

      const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: markdownString,
        ContentType: 'text/markdown',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      console.log(`File uploaded successfully to ${bucketName}/${objectKey}`);
      return true;
    } catch (err: any) {
      console.error('Error uploading file to S3:', err);
      return false;
    }
  }

  public static async removeArticleFromS3(tableName: string, id: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${tableName}/${id}.md`,
      };

      await s3Client.send(new DeleteObjectCommand(params));

      fs.unlink(`src/assets/${tableName}/${id}.md`, (err) => {
        if (err) {
          console.log('Error while removing file from local directory');
          return false;
        }
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public static async removeImageFromS3(id: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `images/${id}.png`,
      };

      await s3Client.send(new DeleteObjectCommand(params));

      // fs.unlink(`src/images/${id}.png`, (err) => {
      //   if (err) {
      //     console.log('Error while removing file from local directory');
      //     return false;
      //   }
      // });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public static readFromS3(tableName: string, id: string) {
    const filePath = `src/assets/${tableName}/${id}.md`;

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');

      const parsed = matter(fileContents);

      return {
        body: parsed.content,
        metadata: parsed.data,
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return undefined;
    }
  }

  // public static async readFromS3(tableName: string, id: string) {
  //   try {
  //     const objectKey = `${tableName}/${id}.md`;
  //     const bucketName = process.env.AWS_S3_BUCKET_NAME;

  //     const params = {
  //       Bucket: bucketName,
  //       Key: objectKey,
  //     };

  //     const command = new GetObjectCommand(params);
  //     const response = await s3Client.send(command);

  //     const fileContents = await response.Body?.transformToString();

  //     if (fileContents == undefined) {
  //       throw new Error('file undefined');
  //     }

  //     const parsed = matter(fileContents);

  //     return {
  //       body: parsed.content,
  //       metadata: parsed.data,
  //     };
  //   } catch (error: any) {
  //     console.error('Error reading file from S3:', error);
  //     return undefined;
  //   }
  // }

  // public static readImage(id: string) {
  //   try {
  //     const imagePath = `src/images/${id}.png`;
  //     const data = fs.readFileSync(imagePath);
  //     return data;
  //   } catch (err) {
  //     console.error('Error reading image:', err);
  //     return undefined;
  //   }
  // }

  public static async saveImage(
    id: string,
    image: any,
    imgWidth: number = 1280,
    imgHeight: number = 720
  ) {
    try {
      image = await sharp(image.buffer)
        .resize({ width: imgWidth, height: imgHeight, fit: 'cover' })
        .png()
        .toBuffer();

      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const objectKey = `images/${id}.png`;

      // // Temporary for local import purposes
      // fs.writeFileSync(`src/images/${id}.png`, image);

      const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: image,
        ContentType: 'image/png',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      console.log(`File uploaded successfully to ${bucketName}/${objectKey}`);
      return true;
    } catch (err: any) {
      console.error('Error uploading file to S3:', err);
      return false;
    }
  }
}
