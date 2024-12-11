import { PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { ArticleInput, PrivateArticle } from '@type/article';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { S3 } from '@services/s3';

export class ArticleCrud {
  private static UNPUBLISHED_TABLE_NAME = 'ArticlesUnpublished';
  private static PUBLISHED_TABLE_NAME = 'ArticlesPublished';

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

    // Fill in the missing fields
    const finishedArticleObject: PrivateArticle = {
      lastEdited: 0,
      createdAt: currentTime,
      status: 'Private',
      deleted: false,
      ...metadata,
    };

    await S3.saveImage(finishedArticleObject.id, finishedArticleObject.image);

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
}
