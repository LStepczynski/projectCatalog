import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { PrivateArticle, PublicArticle } from '@type/article';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { S3 } from '@services/s3';
import { ArticleCrud } from '@services/articleCrud';
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';

type VisibilityType = 'public' | 'private';
export class ArticleService {
  public static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  public static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

  /**
   * Updates all articles authored by the specified author with the given updates.
   * Queries the database for articles by the author and applies the updates to each article.
   *
   * @param {string} author - The identifier of the author whose articles should be updated.
   * @param {Partial<PrivateArticle>} updates - An object containing the fields to update and their new values.
   * @throws {InternalError} - If an error occurs while updating an article.
   * @returns {Promise<void>} - Resolves when all articles have been updated.
   *
   * @example
   * const updates = {
   *   status: 'Private',
   * };
   *
   * try {
   *   await updateArticlesByAuthor('author123', updates);
   *   console.log('All articles updated successfully.');
   * } catch (error) {
   *   console.error('Failed to update articles:', error);
   * }
   */
  public static async updateArticlesByAuthor(
    author: string,
    updates: Partial<PrivateArticle>
  ) {
    // Returns a list of existing articles with only the `id` property
    const privateArticleIds = await this.getUserArticles(
      author,
      this.UNPUBLISHED_TABLE_NAME
    );

    const publicArticleIds = await this.getUserArticles(
      author,
      this.PUBLISHED_TABLE_NAME
    );

    try {
      const privateUpdatePromises = privateArticleIds.map((id: string) => {
        return ArticleCrud.update(id, updates, this.UNPUBLISHED_TABLE_NAME);
      });

      const publicUpdatePromises = publicArticleIds.map((id: string) => {
        return ArticleCrud.update(id, updates, this.PUBLISHED_TABLE_NAME);
      });

      await Promise.all(publicUpdatePromises);
      await Promise.all(privateUpdatePromises);
    } catch (err) {
      throw new InternalError('Error while updating an article.', 500, [
        'updateArticlesByAuthor',
      ]);
    }
  }

  /**
   * Retrieves a list of article IDs authored by the specified user from the given table.
   * Uses the `AuthorDifficultyIndex` index to query the articles efficiently.
   *
   * @param {string} username - The username of the author whose articles should be retrieved.
   * @param {string} table - The name of the database table to query (e.g., published or unpublished articles).
   * @returns {Promise<string[]>} - An array of article IDs authored by the user.
   */
  public static async getUserArticles(
    username: string,
    table: string
  ): Promise<string[]> {
    const params: QueryCommandInput = {
      TableName: table,
      IndexName: 'AuthorDifficultyIndex',
      KeyConditionExpression: 'author = :author',
      ExpressionAttributeValues: {
        ':author': { S: username },
      },
      ProjectionExpression: 'id',
    };

    // Returns a list of existing articles with only the `id` property
    return (await ArticleCrud.query(params)).map(
      (article) => article.id
    ) as string[];
  }
}
