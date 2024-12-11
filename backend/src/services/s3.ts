import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

import dotenv from 'dotenv';

import { InternalError } from '@utils/index';
import { resizeImage } from '@utils/index';

dotenv.config();

const s3Client = new S3Client(
  process.env.DEV_STATE === 'development'
    ? {
        region: 'local',
        endpoint: 'http://localhost:9000',
        credentials: {
          accessKeyId: 'admin',
          secretAccessKey: 'password123',
        },
        forcePathStyle: true,
      }
    : {
        region: process.env.AWS_S3_REGION,
      }
);

export class S3 {
  public static getBucket(): string {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new InternalError('Bucket not found', 500, ['s3BucketNotFound']);
    }
    return bucketName;
  }

  /**
   * Adds an article to the S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName
   * @returns {Promise<string>}
   */
  public static async addToS3(
    tableName: string,
    body: string,
    id: string
  ): Promise<string> {
    // Get the bucket name and generate the object id
    const objectKey = `${tableName}/${id}.txt`;

    // Add the object to the S3
    const params = {
      Bucket: this.getBucket(),
      Key: objectKey,
      Body: body,
      ContentType: 'text',
    };

    // Send command
    const command = new PutObjectCommand(params);
    try {
      await s3Client.send(command);
      return objectKey;
    } catch (err) {
      throw new InternalError('Addition to the S3 failed', 500, ['addToS3']);
    }
  }

  /**
   * Removes an article from the S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name the article is in
   * @param {string} id - article id
   * @returns {Promise<void>}
   */
  public static async removeArticleFromS3(
    tableName: string,
    id: string
  ): Promise<void> {
    const params = {
      Bucket: this.getBucket(),
      Key: `${tableName}/${id}.md`,
    };

    await s3Client.send(new DeleteObjectCommand(params));
  }

  /**
   * Removes an image from S3
   *
   * @public
   * @static
   * @async
   * @param {string} id - image id
   * @returns {Promise<void>}
   */
  public static async removeImageFromS3(id: string): Promise<void> {
    const params = {
      Bucket: this.getBucket(),
      Key: `images/${id}.png`,
    };

    await s3Client.send(new DeleteObjectCommand(params));
  }

  /**
   * Deletes multiple files from S3 in a single batch operation.
   *
   * @public
   * @static
   * @async
   * @param {string[]} keys - Array of S3 object keys to delete.
   * @returns {Promise<void>} - Returns true if all deletions succeeded, otherwise false.
   */
  public static async deleteMultipleFiles(keys: string[]): Promise<void> {
    // Check if there are no files to delete
    if (keys.length === 0) {
      return;
    }

    const params = {
      Bucket: this.getBucket(),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    };

    const command = new DeleteObjectsCommand(params);
    const response = await s3Client.send(command);

    // Throw an internal error if there were problems deleting
    if (response.Errors && response.Errors.length > 0) {
      throw new InternalError(
        `Error while batch deleting files in S3: ${response.Errors}`,
        500,
        ['s3BatchDelete']
      );
    }
  }

  /**
   * Reads an article from S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name the article is in
   * @param {string} id - article id
   * @returns {string} - Fetched article
   */
  public static async readFromS3(tableName: string, id: string) {
    const objectKey = `${tableName}/${id}.md`;

    const params = {
      Bucket: this.getBucket(),
      Key: objectKey,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const fileContents = await response.Body?.transformToString();

    if (fileContents == undefined) {
      throw new InternalError('Article body not found in the S3', 500, [
        's3GetObject',
      ]);
    }

    return fileContents;
  }

  /**
   * Resizes an image, changes it to png and saves it to S3
   *
   * @public
   * @static
   * @async
   * @param {string} id - the id for the image
   * @param {*} image - image
   * @param {number} [imgWidth=1280] - Width to which the image is going to be resized to
   * @param {number} [imgHeight=720] - Height to which the image is going to be resized to
   * @returns {Promise<string>} - Returns if the operation succeeded
   */
  public static async saveImage(
    id: string,
    image: string,
    imgWidth: number = 1280,
    imgHeight: number = 720
  ) {
    // Resizes an image
    const resizedImage = await resizeImage(image, imgWidth, imgHeight);

    // Get the bucket name and generate image key
    const bucketName = this.getBucket();
    const objectKey = `images/${id}.webp`;

    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: resizedImage,
      ContentType: 'image/webp',
    };

    const command = new PutObjectCommand(params);
    try {
      await s3Client.send(command);
      return `https://${this.getBucket()}.s3.${
        process.env.AWS_S3_REGION
      }.amazonaws.com/${objectKey}`;
    } catch (err) {
      throw new InternalError('Addition to the S3 failed', 500, ['saveImage']);
    }
  }
}
