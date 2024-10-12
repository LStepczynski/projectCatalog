import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

import dotenv from 'dotenv';

import matter from 'gray-matter';
import sharp from 'sharp';
import fs from 'fs';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
});

export class S3 {
  /**
   * Adds an article to the S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName
   * @param {*} metadata - The metadata of an article as a dictionary
   * @param {string} body - The body of the article
   * @returns {Promise<boolean>} - Returns if the operation succeeded
   */
  public static async addToS3(
    tableName: string,
    metadata: any,
    body: string
  ): Promise<boolean> {
    try {
      const markdownString = matter.stringify(body, metadata);

      // Get the bucket name and generate the object id
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const objectKey = `${tableName}/${metadata.ID}.md`;

      // Temporary for local import purposes
      // fs.writeFileSync(
      //   `src/assets/${tableName}/${metadata.ID}.md`,
      //   markdownString,
      //   'utf8'
      // );

      // Add the object to the S3
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

  /**
   * Removes an article from the S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name the article is in
   * @param {string} id - article id
   * @returns {boolean} - Returns if the operation succeeded
   */
  public static async removeArticleFromS3(tableName: string, id: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${tableName}/${id}.md`,
      };

      await s3Client.send(new DeleteObjectCommand(params));

      // Temporary for local import purposes
      // fs.unlink(`src/assets/${tableName}/${id}.md`, (err) => {
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

  /**
   * Removes an image from S3
   *
   * @public
   * @static
   * @async
   * @param {string} id - image id
   * @returns {boolean} - Returns if the operation succeeded
   */
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

  // /**
  //  * Reads an article from S3 and returns it
  //  * TEMPORARY - for development purposes this
  //  * function reads from the hard drive
  //  *
  //  * @public
  //  * @static
  //  * @param {string} tableName - table name the article is in
  //  * @param {string} id - article id
  //  * @returns {{ body: any; metadata: any; }} - Fetched article
  //  */
  // public static readFromS3(tableName: string, id: string) {
  //   const filePath = `src/assets/${tableName}/${id}.md`;

  //   try {
  //     const fileContents = fs.readFileSync(filePath, 'utf8');

  //     const parsed = matter(fileContents);

  //     return {
  //       body: parsed.content,
  //       metadata: parsed.data,
  //     };
  //   } catch (error) {
  //     console.error('Error reading file:', error);
  //     return undefined;
  //   }
  // }

  /**
   * Deletes multiple files from S3 in a single batch operation.
   *
   * @public
   * @static
   * @async
   * @param {string[]} keys - Array of S3 object keys to delete.
   * @returns {Promise<boolean>} - Returns true if all deletions succeeded, otherwise false.
   */
  public static async deleteMultipleFiles(keys: string[]): Promise<boolean> {
    if (keys.length === 0) {
      return true;
    }

    // Temporary for local import purposes
    // for (const key of keys) {
    //   if (key.startsWith('images')) continue;
    //   fs.unlink(`src/assets/${key}`, (err) => {
    //     if (err) {
    //       console.log('Error while removing file from local directory');
    //       return false;
    //     }
    //   });
    // }

    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      };

      const command = new DeleteObjectsCommand(params);
      const response = await s3Client.send(command);

      if (response.Errors && response.Errors.length > 0) {
        console.error(
          'Errors occurred while deleting some files:',
          response.Errors
        );
        return false;
      }

      console.log(`Successfully deleted ${keys.length} files from S3.`);
      return true;
    } catch (err: any) {
      console.error('Error deleting multiple files from S3:', err);
      return false;
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
   * @returns {{ body: any; metadata: any; }} - Fetched article
   */
  public static async readFromS3(tableName: string, id: string) {
    try {
      const objectKey = `${tableName}/${id}.md`;
      const bucketName = process.env.AWS_S3_BUCKET_NAME;

      const params = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);

      const fileContents = await response.Body?.transformToString();

      if (fileContents == undefined) {
        throw new Error('file undefined');
      }

      const parsed = matter(fileContents);

      return {
        body: parsed.content,
        metadata: parsed.data,
      };
    } catch (error: any) {
      console.error('Error reading file from S3:', error);
      return undefined;
    }
  }

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
   * @returns {boolean} - Returns if the operation succeeded
   */
  public static async saveImage(
    id: string,
    image: any,
    imgWidth: number = 1280,
    imgHeight: number = 720
  ) {
    try {
      // Resizes an image
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      image = await sharp(imageBuffer)
        .resize({ width: imgWidth, height: imgHeight, fit: 'cover' })
        .png()
        .toBuffer();

      // Get the bucket name and generate image key
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
