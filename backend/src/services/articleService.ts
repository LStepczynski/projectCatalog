import {
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

export class ArticleService {
  public static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  public static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

  private static DEFAULT_BANNER_LINK =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/banner.webp';

  // private static DEFAULT_BANNER_LINK =
  //   'http://localhost:9000/project-catalog-storage/images/banner.webp';

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
    metadata: Partial<PrivateArticle>,
    body: string
  ): Promise<PrivateArticle> {
    const currentTime = getUnixTimestamp();

    // Save image
    let imageURL;
    if (metadata.image) {
      imageURL = await S3.saveImage(metadata.id!, metadata.image);
    }

    // Fill in the missing fields
    const finishedArticleObject = {
      lastEdited: 0,
      createdAt: currentTime,
      status: 'Private',
      tags: [],
      ...metadata,
      image: imageURL ? imageURL : this.DEFAULT_BANNER_LINK, // Replace the base64 string for S3 url
    } as PrivateArticle;

    await S3.addToS3(
      this.UNPUBLISHED_TABLE_NAME,
      body,
      finishedArticleObject.id
    );

    return (await ArticleCrud.add(
      finishedArticleObject,
      this.UNPUBLISHED_TABLE_NAME
    )) as PrivateArticle;
  }

  /**
   * Modifies the like count for a specified article by a given amount.
   *
   * @param {string} id - The ID of the article whose like count is to be modified.
   * @param {number} amount - The amount to increment or decrement the like count. Positive values increment, negative values decrement.
   *
   * @throws {InternalError} 500 - If there is an error modifying the database entry.
   *
   * @returns {Promise<PublicArticle | null>} - Returns the updated article object if successful, or `null` if the update failed.
   */
  public static async modifyLikeCount(
    id: string,
    amount: number
  ): Promise<PublicArticle | null> {
    const params: UpdateItemCommandInput = {
      TableName: this.PUBLISHED_TABLE_NAME,
      Key: {
        id: { S: id },
      },
      UpdateExpression: 'SET likes = if_not_exists(likes, :start) + :increment',
      ExpressionAttributeValues: {
        ':start': { N: '0' },
        ':increment': { N: String(amount) },
      },
      ReturnValues: 'UPDATED_NEW',
    };

    try {
      const resp = await client.send(new UpdateItemCommand(params));
      if (resp.Attributes) {
        return unmarshall(resp.Attributes) as PublicArticle;
      }
      return null;
    } catch (err) {
      throw new InternalError('Error modifying the database', 500, [
        'modifyLikeCount',
      ]);
    }
  }

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
