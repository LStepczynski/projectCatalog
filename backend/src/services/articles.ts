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
import fs, { stat } from 'fs';

import { v4 as uuidv4 } from 'uuid';

import { client } from './dynamodb';

interface Dictionary {
  [key: string]: any;
}

interface Table {
  tableName: string;
  item: Dictionary;
}

type TableReturn = Table | false;
export class Articles {
  private static TABLE_NAMES: Readonly<Table[]> = [
    {
      tableName: 'ArticlesPublished',
      item: {
        Title: { value: '', required: true },
        Description: { value: '', required: true },
        Author: { value: '', required: true },
        PrimaryCategory: { value: '', required: true },
        SecondaryCategories: { value: [], required: true },
        Rating: { value: 0, required: true },
        CreatedAt: { value: 0, required: true },
        UpdatedAt: { value: 0, required: true },
        PublishedAt: { value: 0, required: false },
        Difficulty: { value: '', required: true },
      },
    },
    {
      tableName: 'ArticlesUnpublished',
      item: {
        Title: { value: '', required: true },
        Description: { value: '', required: true },
        Author: { value: '', required: true },
        PrimaryCategory: { value: '', required: true },
        SecondaryCategories: { value: [], required: true },
        Rating: { value: 0, required: true },
        CreatedAt: { value: 0, required: false },
        UpdatedAt: { value: 0, required: true },
        Difficulty: { value: '', required: true },
      },
    },
  ];

  public static findTable(name: string): TableReturn {
    for (const tableName of Articles.TABLE_NAMES) {
      if (name === tableName.tableName) {
        return tableName;
      }
    }
    return false;
  }

  // PROBLEM VALIDATION KEY ERROR
  public static async get(
    articleId: string,
    tableName: string
  ): Promise<any | void> {
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { error: 'table not found' } };
    }

    if (typeof articleId != 'string') {
      return {
        status: 400,
        response: { error: 'invalid article id data type' },
      };
    }

    const command = new GetItemCommand({
      TableName: tableName,
      Key: {
        ID: { S: articleId },
      },
    });

    try {
      let resp = await client.send(command);

      if (Object.keys(resp).includes('Item') && resp.Item) {
        return { status: 200, response: { return: [unmarshall(resp.Item)] } };
      }
      return { status: 500, response: { error: 'server error' } };
    } catch (err) {
      console.log(err);
      return { status: 500, response: { error: 'server error' } };
    }
  }

  public static async create(
    tableName: string,
    metadata: any,
    body: string
  ): Promise<any | void> {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { error: 'table not found' } };
    }

    if (!(await this.validateArticle(metadata, tableInfo.item))) {
      return { status: 400, response: { error: 'invalid metadata format' } };
    }

    if (typeof body !== 'string') {
      return { status: 400, response: { error: 'invalid body data type' } };
    }

    // Adding attributes to the metadata
    metadata.ID = uuidv4();
    const currentTime = Math.floor(new Date().getTime() / 1000);
    if (tableName == 'ArticlesPublished' && metadata.PublishedAt == undefined) {
      metadata.PublishedAt = currentTime;
    }
    if (tableName == 'ArticlesUnpublished' && metadata.CreatedAt == undefined) {
      metadata.CreatedAt = currentTime;
    }
    console.log(metadata.CreatedAt);
    // Adding the body to S3
    if (!(await Articles.addToS3(tableName, metadata, body))) {
      return { status: 500, response: { error: 'server error' } };
    }

    // Converting any lists into sets
    metadata.SecondaryCategories = new Set(metadata.SecondaryCategories);

    // Adding the articles to the database
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: marshall(metadata),
    };

    try {
      await client.send(new PutItemCommand(params));
      return { status: 200, response: { message: 'item added succesfully' } };
    } catch (err: any) {
      return { status: 500, response: { error: err } };
    }
  }

  public static async validateArticle(article: Dictionary, model: Dictionary) {
    const articleModelFields = Object.keys(model);

    // Check if all fields in ARTICLE_MODEL are present and not empty in the article
    for (const field of articleModelFields) {
      const isEmpty =
        article[field] === undefined ||
        article[field] === '' ||
        (Array.isArray(article[field]) && article[field].length === 0);
      const isRequired = model[field].required == true;
      const isSameType = typeof model[field].value == typeof article[field];

      if ((isEmpty && isRequired) || (!isSameType && !isEmpty)) {
        return false; // Field is missing, empty, or incorrect type
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

  public static async addToS3(tableName: string, metadata: any, body: string) {
    try {
      const markdownString = matter.stringify(body, metadata);
      fs.writeFileSync(
        `src/assets/${tableName}/${metadata.ID}.md`,
        markdownString,
        'utf8'
      );
      return true;
    } catch (err: any) {
      return false;
    }
  }

  // public static async getCategoryPage(
  //   tableName: string,
  //   category: string,
  //   page: number,
  //   limit: number
  // ): Promise<any | void> {
  //   if (this.findTable(tableName) == false) {
  //     return { status: 400, response: { error: 'table not found' } };
  //   }

  //   const params: QueryCommandInput = {
  //     TableName: Articles.TABLE_NAMES,
  //     IndexName: 'PrimaryCategoryIndex',
  //     KeyConditionExpression: 'primaryCategory = :c',
  //     ExpressionAttributeValues: {
  //       ':c': { S: category },
  //     },
  //     Limit: limit,
  //     ScanIndexForward: false,
  //   };

  //   let count = 0;
  //   while (true) {
  //     count += 1;

  //     // Use the query method to retrieve items for the specified category
  //     const data = await client.send(new QueryCommand(params));
  //     if (data.LastEvaluatedKey) {
  //       params.ExclusiveStartKey = data.LastEvaluatedKey;
  //     }

  //     // Return items if the desired page is reached or if there are no more pages
  //     if (count === page || !data.LastEvaluatedKey) {
  //       const items: any = data.Items
  //         ? data.Items.map((item) => unmarshall(item))
  //         : [];
  //       return items;
  //     }
  //   }
  // }
}
