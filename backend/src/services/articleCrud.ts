import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { ArticleInput, PrivateArticle, PublicArticle } from '@type/article';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { S3 } from '@services/s3';

type VisibilityType = 'public' | 'private';
export class ArticleCrud {
  private static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  private static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

  public static visibilityToTable(visibility: VisibilityType): string {
    if (visibility === 'private') return this.UNPUBLISHED_TABLE_NAME;
    return this.PUBLISHED_TABLE_NAME;
  }

  /**
   * Creates a new article and stores its metadata, content, and associated image in the respective storage systems.
   *
   * This method performs the following actions:
   * - Generates timestamps for the article's creation and last edited fields.
   * - Saves the article's image to an S3 bucket.
   * - Stores the article's content in S3.
   * - Persists the article's metadata in a DynamoDB table.
   *
   * @param {ArticleInput} metadata - The metadata of the article, including fields like `title`, `author`, etc.
   * @param {string} body - The content of the article.
   * @returns {Promise<PrivateArticle>} - A promise resolving to the created article object, containing all metadata fields and timestamps.
   *
   * @throws {InternalError} - If an error occurs while saving the article's metadata, image, or content.
   *
   * @example
   * const metadata = {
   *   title: 'My New Article',
   *   author: 'John Doe',
   *   image: 'data:image/png;base64,...'
   * };
   * const body = 'This is the content of the article.';
   *
   * try {
   *   const createdArticle = await ArticleCrud.create(metadata, body);
   *   console.log('Article created:', createdArticle);
   * } catch (error) {
   *   console.error('Failed to create article:', error.message);
   * }
   */
  public static async create(
    metadata: ArticleInput,
    body: string
  ): Promise<PrivateArticle> {
    const currentTime = getUnixTimestamp();

    // Save image
    const imageURL = await S3.saveImage(metadata.id, metadata.image);

    // Fill in the missing fields
    const finishedArticleObject: PrivateArticle = {
      lastEdited: 0,
      createdAt: currentTime,
      status: 'Private',
      ...metadata,
      image: imageURL, // Replace the base64 string for S3 url
    };

    await S3.addToS3(
      this.UNPUBLISHED_TABLE_NAME,
      body,
      finishedArticleObject.id
    );

    // Request params
    const params: PutItemCommandInput = {
      TableName: this.UNPUBLISHED_TABLE_NAME,
      Item: marshall(finishedArticleObject),
    };

    try {
      await client.send(new PutItemCommand(params));
      return finishedArticleObject;
    } catch (err) {
      throw new InternalError('Addition to the database failed', 500, [
        'createArticle',
      ]);
    }
  }

  public static async getBody(id: string, table: string) {
    return await S3.readFromS3(table, id);
  }

  /**
   * Fetches metadata for a specific item from a DynamoDB table.
   *
   * @param {string} id - The unique identifier of the item.
   * @param {string} table - The name of the DynamoDB table.
   * @returns {Promise<PrivateArticle | PublicArticle | null>} - Returns the unmarshalled item if found, otherwise null.
   * @throws {InternalError} - Throws if an unexpected error occurs while fetching the item.
   */
  public static async getMetadata(id: string, table: string) {
    // Request Params
    const params: GetItemCommandInput = {
      TableName: table,
      Key: {
        id: { S: id },
      },
    };

    try {
      const resp = await client.send(new GetItemCommand(params));

      // Return the item if found
      if (resp.Item) {
        return unmarshall(resp.Item) as PrivateArticle | PublicArticle;
      }

      return null;
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        'Error while fetching the article from the database',
        500,
        ['getMetadata', 'article']
      );
    }
  }

  /**
   * Deletes a specific item from a DynamoDB table and S3.
   *
   * @param {string} id - The unique identifier of the item to delete.
   * @param {string} table - The name of the table.
   * @returns {Promise<PrivateArticle | PublicArticle | null>} - Returns the unmarshalled item if found and deleted, otherwise null.
   * @throws {InternalError} - Throws if an unexpected error occurs while deleting the item.
   */
  public static async delete(id: string, table: string) {
    // Request Params
    const params: DeleteItemCommandInput = {
      TableName: table,
      Key: {
        id: { S: id },
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      // Remove from S3
      await S3.removeArticleFromS3(table, id);
      await S3.removeImageFromS3(id);

      // Remove from DB
      const resp = await client.send(new DeleteItemCommand(params));

      // Return the item if found
      if (resp.Attributes) {
        return unmarshall(resp.Attributes) as PrivateArticle | PublicArticle;
      }

      return null;
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        'Error while deleting the article from the database',
        500,
        ['getMetadata', 'article']
      );
    }
  }

  public static async update(id: string, updates: Record<string, any>) {
    // Check if `updates` is empty
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return;

    // Replace the base64 string with an S3 link
    if (updateKeys.includes('image')) {
      const url = await S3.saveImage(id, updates.image);
      updates.image = url;
    }

    // Update the body in the S3
    if (updateKeys.includes('body')) {
      try {
        await S3.addToS3(this.UNPUBLISHED_TABLE_NAME, updates['body'], id);
      } catch (error) {
        throw new InternalError('Failed to upload the body to S3.', 500, [
          'updateArticle',
        ]);
      }
      if (updateKeys.length === 1) return { s3Updated: true };
    }

    // Prepare the UpdateCommand
    let updateExpression = 'SET';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build UpdateExpression and ExpressionAttributeValues dynamically
    updateKeys.forEach((key, index) => {
      const attributePlaceholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      // Append to UpdateExpression
      updateExpression += ` ${attributePlaceholder} = ${valuePlaceholder},`;

      // Add to ExpressionAttributeNames
      expressionAttributeNames[attributePlaceholder] = key;

      // Use marshall to convert the value dynamically
      const marshalledValue = marshall({ value: updates[key] }); // Wrap in object
      expressionAttributeValues[valuePlaceholder] = marshalledValue.value; // Extract formatted value
    });

    const params: UpdateItemCommandInput = {
      TableName: this.UNPUBLISHED_TABLE_NAME,
      Key: marshall({ id }), // Use marshall for the Key
      UpdateExpression: updateExpression.slice(0, -1), // Remove trailing comma
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    // Send request
    try {
      await client.send(new UpdateItemCommand(params));
    } catch (error) {
      throw new InternalError(
        'Failed to update the item in the database.',
        500,
        ['updateArticle']
      );
    }
  }
}
