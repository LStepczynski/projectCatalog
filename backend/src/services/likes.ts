import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';

export class Likes {
  public static TABLE_NAME = 'Likes';

  /**
   * Creates a like entry in the database for the specified article and user.
   *
   * @param {string} articleId - The ID of the article to be liked.
   * @param {string} username - The username of the user liking the article.
   *
   * @throws {InternalError} 500 - If there is an error adding the entry to the database.
   *
   * @returns {Promise<void>} - Resolves when the like is successfully added.
   */
  public static async create(
    articleId: string,
    username: string
  ): Promise<void> {
    const params: PutItemCommandInput = {
      TableName: this.TABLE_NAME,
      Item: marshall({
        username: username,
        article: articleId,
      }),
    };

    try {
      await client.send(new PutItemCommand(params));
    } catch (err) {
      throw new InternalError('Error adding to the database', 500, [
        'Likes',
        'create',
      ]);
    }
  }

  /**
   * Retrieves a like entry from the database for the specified article and user.
   *
   * @param {string} articleId - The ID of the article to look up.
   * @param {string} username - The username of the user associated with the like.
   *
   * @throws {InternalError} 500 - If there is an error fetching the entry from the database.
   *
   * @returns {Promise<Record<string, string> | null>} - Returns the like entry if found, or `null` if it does not exist.
   */
  public static async get(
    articleId: string,
    username: string
  ): Promise<Record<string, string> | null> {
    const params: GetItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        username: { S: username },
        article: { S: articleId },
      },
    };

    try {
      const resp = await client.send(new GetItemCommand(params));
      if (resp.Item) {
        return unmarshall(resp.Item);
      }
      return null;
    } catch (err) {
      throw new InternalError('Error fetching from the database', 500, [
        'Likes',
        'get',
      ]);
    }
  }

  /**
   * Deletes a like entry from the database for the specified article and user.
   *
   * @param {string} articleId - The ID of the article to remove the like from.
   * @param {string} username - The username of the user whose like is to be removed.
   *
   * @throws {InternalError} 500 - If there is an error deleting the entry from the database.
   *
   * @returns {Promise<Record<string, string> | null>} - Returns the deleted like entry if it existed, or `null` if it did not exist.
   */
  public static async delete(
    articleId: string,
    username: string
  ): Promise<Record<string, string> | null> {
    const params: DeleteItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        username: { S: username },
        article: { S: articleId },
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      const resp = await client.send(new DeleteItemCommand(params));
      if (resp.Attributes) {
        return unmarshall(resp.Attributes);
      }
      return null;
    } catch (err) {
      throw new InternalError('Error deleting from the database', 500, [
        'Likes',
        'delete',
      ]);
    }
  }
}
