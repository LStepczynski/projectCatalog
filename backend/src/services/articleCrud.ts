import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { PrivateArticle, PublicArticle } from '@type/article';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { S3 } from '@services/s3';
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

type VisibilityType = 'public' | 'private';
export class ArticleCrud {
  public static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  public static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

  public static visibilityToTable(visibility: VisibilityType): string {
    if (visibility === 'private') return this.UNPUBLISHED_TABLE_NAME;
    return this.PUBLISHED_TABLE_NAME;
  }

  /**
   * Adds a new article to the specified database table.
   *
   * @param {PrivateArticle | PublicArticle} article - The article object to be added to the database.
   * @param {string} table - The name of the database table where the article should be added.
   *
   * @throws {InternalError} 500 - If there is an error adding the article to the database.
   *
   * @returns {Promise<PrivateArticle | PublicArticle>} - Returns the added article object if successful.
   */
  public static async add(
    article: PrivateArticle | PublicArticle,
    table: string
  ) {
    // Request params
    const params: PutItemCommandInput = {
      TableName: table,
      Item: marshall(article),
    };
    try {
      await client.send(new PutItemCommand(params));
      return article;
    } catch (err) {
      throw new InternalError('Addition to the database failed', 500, [
        'addArticle',
      ]);
    }
  }

  /**
   * Queries the DynamoDB table for multiple users based on the provided query parameters.
   *
   * @param params - The query parameters to execute the DynamoDB query.
   *                 These include `TableName`, `KeyConditionExpression`, and other optional query conditions.
   * @returns A promise that resolves to an array of `User` objects matching the query conditions.
   *          Returns an empty array if no users are found.
   * @throws InternalError - If an unexpected issue occurs during the query execution.
   */
  public static async query(
    params: QueryCommandInput
  ): Promise<PrivateArticle[] | PublicArticle[]> {
    // Add the table name to the params
    const completeParams: QueryCommandInput = {
      ...params,
    };

    try {
      const resp = await client.send(new QueryCommand(completeParams));

      // Return the user objects
      if (resp.Items && resp.Items.length > 0) {
        return resp.Items.map((item) => unmarshall(item)) as
          | PrivateArticle[]
          | PublicArticle[];
      }

      // Return an empty array if no users found
      return [];
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        'Error while fetching articles from the database',
        500,
        ['queryArticles']
      );
    }
  }

  /**
   * Retrieves a specific page of items from a paginated query result in a database.
   *
   * @param {number} page - The page number to retrieve (1-based indexing).
   * @param {QueryCommandInput} params - The query parameters for the database operation.
   *
   * @throws {InternalError} 500 - If there is an error executing the query command.
   *
   * @returns {Promise<any[]>} - Returns an array of items for the specified page. Returns an empty array if no items exist for the page.
   */
  public static async getPagination(page: number, params: QueryCommandInput) {
    // Page count
    let count = 0;
    while (true) {
      count += 1;

      // Use the query method to retrieve items for the specified category
      const data = await client.send(new QueryCommand(params));
      if (data.LastEvaluatedKey) {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
      }

      // Return items if the desired page is reached or if there are no more pages
      if (count === page || !data.LastEvaluatedKey) {
        const items: any = data.Items
          ? data.Items.map((item) => unmarshall(item))
          : [];
        return items;
      }
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
   * @param {boolean} removeImage - Determines if the image will be deleted
   * @returns {Promise<PrivateArticle | PublicArticle | null>} - Returns the unmarshalled item if found and deleted, otherwise null.
   * @throws {InternalError} - Throws if an unexpected error occurs while deleting the item.
   */
  public static async delete(
    id: string,
    table: string,
    removeImage: boolean = true
  ) {
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
      if (removeImage) {
        await S3.removeImageFromS3(id);
      }

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

  /**
   * Deletes multiple items from the specified database table in batches.
   * Splits the IDs into manageable chunks of up to 25 items per batch for DynamoDB's batch operations.
   * Retries any unprocessed items as necessary.
   *
   * @param {string[]} ids - An array of IDs representing the items to delete.
   * @param {string} table - The name of the database table from which to delete the items.
   * @throws {InternalError} - If an error occurs during the batch delete operation.
   * @returns {Promise<void>} - Resolves when all items are successfully deleted.
   */
  public static async batchDelete(ids: string[], table: string): Promise<void> {
    const MAX_BATCH_SIZE = 25;
    const batches = [];

    // Split the IDs into batches of 25
    for (let i = 0; i < ids.length; i += MAX_BATCH_SIZE) {
      batches.push(ids.slice(i, i + MAX_BATCH_SIZE));
    }

    // Process each batch
    for (const batch of batches) {
      const params: BatchWriteCommandInput = {
        RequestItems: {
          [table]: batch.map((id) => ({
            DeleteRequest: {
              Key: { id: id },
            },
          })),
        },
      };

      try {
        const result = await client.send(new BatchWriteCommand(params));

        // Handle unprocessed items
        if (
          result.UnprocessedItems &&
          Object.keys(result.UnprocessedItems).length > 0
        ) {
          await this.retryUnprocessedItems(result.UnprocessedItems, table);
        }
      } catch (error) {
        throw new InternalError('Error while deleting from the database', 500, [
          'batchDelete',
          'articleService',
        ]);
      }
    }
  }

  /**
   * Retries deleting unprocessed items from a batch delete operation.
   * Recursively attempts to process any unprocessed items until all are successfully deleted.
   *
   * @param {BatchWriteCommandInput['RequestItems']} unprocessedItems - The unprocessed items from a previous batch delete attempt.
   * @param {string} table - The name of the database table associated with the unprocessed items.
   * @throws {InternalError} - If an error occurs while retrying the deletion of unprocessed items.
   * @returns {Promise<void>} - Resolves when all unprocessed items are successfully deleted.
   */
  private static async retryUnprocessedItems(
    unprocessedItems: BatchWriteCommandInput['RequestItems'],
    table: string
  ): Promise<void> {
    const params: BatchWriteCommandInput = { RequestItems: unprocessedItems };

    try {
      const result = await client.send(new BatchWriteCommand(params));
      if (
        result.UnprocessedItems &&
        Object.keys(result.UnprocessedItems).length > 0
      ) {
        await this.retryUnprocessedItems(result.UnprocessedItems, table);
      }
    } catch (error) {
      throw new InternalError('Error while reprocessing items.', 500, [
        'retryUnprocessedItems',
      ]);
    }
  }

  /**
   * @TODO: Test image updates
   * @TODO: Test lastEdited property
   *
   * Updates an item in the database by its `id` with the provided `updates`.
   * Supports special handling for `image` and `body` properties, including S3 operations.
   * Dynamically builds update expressions for efficient database updates.
   *
   * @param {string} id - The unique identifier of the item to update.
   * @param {Record<string, any>} updates - An object containing the fields to update and their new values.
   * @param {string} table - Selected table name
   * @throws {InternalError} - If the body upload to S3 fails or if the database update operation fails.
   * @returns {Promise<PrivateArticle | null>} - The updated item as an object, or undefined if no updates were applied.
   *
   * @example
   * const updates = {
   *   title: 'New Title',
   *   image: 'base64string',
   *   body: 'Updated content body',
   * };
   *
   * try {
   *   const updatedItem = await update('item123', updates);
   *   console.log('Updated item:', updatedItem);
   * } catch (error) {
   *   console.error('Failed to update item:', error);
   * }
   */
  public static async update(
    id: string,
    updates: Record<string, any>,
    table: string = this.UNPUBLISHED_TABLE_NAME
  ): Promise<PrivateArticle | null> {
    // Check if `updates` is empty
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return null;

    if (!updateKeys.includes('lastEdited')) {
      updateKeys.push('lastEdited');
    }
    updates.lastEdited = getUnixTimestamp();

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
      if (updateKeys.length === 1) return null;
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
      TableName: table,
      Key: marshall({ id }), // Use marshall for the Key
      UpdateExpression: updateExpression.slice(0, -1), // Remove trailing comma
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    };

    // Send request
    try {
      const response = await client.send(new UpdateItemCommand(params));
      return unmarshall(response.Attributes!) as PrivateArticle;
    } catch (err) {
      throw new InternalError(
        'Failed to update the item in the database.',
        500,
        ['updateArticle']
      );
    }
  }
}
