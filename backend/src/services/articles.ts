import {
  GetItemCommand,
  PutItemCommand,
  PutItemCommandInput,
  BatchGetItemCommand,
  QueryCommandInput,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

import matter from 'gray-matter';
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid';

import { client } from './dynamodb';

export class Articles {
  private static TABLE_NAME: Readonly<string> = 'Articles';
  private static ARTICLE_MODEL: Readonly<any> = {
    Title: '',
    Description: '',
    Author: '',
    PrimaryCategory: '',
    SecondaryCategories: [],
    rating: 0,
    CreatedAt: '',
    UpdatedAt: '',
    PublishedAt: '',
    Status: '',
    Difficulty: '',
  };

  /**
   * Get a specific article
   * @param {STRING} articleId
   * @returns
   */
  public static async get(articleId: string): Promise<any | void> {
    const command = new GetItemCommand({
      TableName: Articles.TABLE_NAME,
      Key: marshall({ id: articleId }),
    });
    let resp = await client.send(command);

    if (Object.keys(resp).includes('Item') && resp.Item) {
      return unmarshall(resp.Item);
    }
  }

  public static async validateArticle(article: any) {
    const articleModelFields = Object.keys(Articles.ARTICLE_MODEL);

    // Check if all fields in ARTICLE_MODEL are present and not empty in the article
    for (const field of articleModelFields) {
      if (
        article[field] === undefined ||
        article[field] === '' ||
        (Array.isArray(article[field]) && article[field].length === 0)
      ) {
        return false; // Field is missing or empty
      }
    }

    // Check if there are no additional fields in article that are not in ARTICLE_MODEL
    for (const field of Object.keys(article)) {
      if (!articleModelFields.includes(field)) {
        return false; // Additional field found in article
      }
    }

    return true;
  }

  public static async create(metadata: any, body: string): Promise<any | void> {
    if (!(await this.validateArticle(metadata))) {
      return { status: 400, response: { error: 'invalid metadata format' } };
    }

    if (typeof body !== 'string') {
      return { status: 400, response: { error: 'invalid body data type' } };
    }

    metadata.ID = uuidv4();

    if (!(await Articles.addToS3(metadata, body))) {
      console.log('s3');
      return { status: 500, response: { error: 'server error' } };
    }

    metadata.SecondaryCategories = new Set(metadata.SecondaryCategories);
    const params: PutItemCommandInput = {
      TableName: 'Articles',
      Item: marshall(metadata),
    };

    try {
      await client.send(new PutItemCommand(params));
      return { status: 200, response: { message: 'item added succesfully' } };
    } catch (err: any) {
      return { status: 500, response: { error: err } };
    }
  }

  public static async addToS3(metadata: any, body: string) {
    try {
      const markdownString = matter.stringify(body, metadata);
      fs.writeFileSync(
        `src/assets/articles/${metadata.ID}.md`,
        markdownString,
        'utf8'
      );
      return true;
    } catch (err: any) {
      return false;
    }
  }

  public static async getCategoryPage(
    category: string,
    page: number,
    limit: number
  ): Promise<any | void> {
    const params: QueryCommandInput = {
      TableName: Articles.TABLE_NAME,
      IndexName: 'PrimaryCategoryIndex',
      KeyConditionExpression: 'primaryCategory = :c',
      ExpressionAttributeValues: {
        ':c': { S: category },
      },
      Limit: limit,
      ScanIndexForward: false,
    };

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
}
