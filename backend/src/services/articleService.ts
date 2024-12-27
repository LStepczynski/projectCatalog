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

type VisibilityType = 'public' | 'private';
export class ArticleService {
  private static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  private static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

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
    const params: QueryCommandInput = {
      TableName: this.UNPUBLISHED_TABLE_NAME,
      IndexName: 'AuthorDifficultyIndex',
      KeyConditionExpression: 'author = :author',
      ExpressionAttributeValues: {
        ':author': { S: author },
      },
      ProjectionExpression: 'id',
    };

    // Returns a list of existing articles with only the `id` property
    const authorArticleIds = (await ArticleCrud.query(params)).map(
      (article) => article.id
    ) as string[];

    try {
      const updatePromises = authorArticleIds.map((id: string) => {
        return ArticleCrud.update(id, updates);
      });

      await Promise.all(updatePromises);
    } catch (err) {
      throw new InternalError('Error while updating an article.', 500, [
        'updateArticlesByAuthor',
      ]);
    }
  }
}
