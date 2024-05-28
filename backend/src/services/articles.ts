import {
  GetItemCommand,
  PutItemCommand,
  PutItemCommandInput,
  DeleteItemCommand,
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
        UpdatedAt: { value: 0, required: false },
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
        UpdatedAt: { value: 0, required: false },
        Difficulty: { value: '', required: true },
      },
    },
  ];

  public static isValidUUID(uuid: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  public static findTable(name: string): TableReturn {
    for (const tableName of Articles.TABLE_NAMES) {
      if (name === tableName.tableName) {
        return tableName;
      }
    }
    return false;
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

  public static removeFromS3(tableName: string, id: string) {
    fs.unlink(`src/assets/${tableName}/${id}.md`, (err) => {
      return false;
    });
    return true;
  }

  public static readFromS3(tableName: string, id: string) {
    const filePath = `src/assets/${tableName}/${id}.md`;

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');

      const parsed = matter(fileContents);

      return {
        body: parsed.content,
        metadata: parsed.data,
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return undefined;
    }
  }

  public static async getArticle(
    articleId: string,
    tableName: string
  ): Promise<any | void> {
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (articleId == undefined) {
      return {
        status: 400,
        response: { message: 'missing article id' },
      };
    }

    if (typeof articleId != 'string') {
      return {
        status: 400,
        response: { message: 'invalid article id data type' },
      };
    }

    try {
      const response = this.readFromS3(tableName, articleId);
      if (response == undefined) {
        return { status: 404, response: { message: 'item not found' } };
      }

      return { status: 200, response: { return: response } };
    } catch (err) {
      console.log(err);
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static async createArticle(
    tableName: string,
    metadata: any,
    body: string,
    id: string = ''
  ): Promise<any | void> {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (!(await this.validateArticle(metadata, tableInfo.item))) {
      return { status: 400, response: { message: 'invalid metadata format' } };
    }

    if (typeof body !== 'string') {
      return { status: 400, response: { message: 'invalid body data type' } };
    }

    // Adding attributes to the metadata
    if (!this.isValidUUID(id)) {
      metadata.ID = uuidv4();
    } else {
      metadata.ID = id;
    }
    const currentTime = Math.floor(new Date().getTime() / 1000);
    if (tableName == 'ArticlesPublished' && metadata.PublishedAt == undefined) {
      metadata.PublishedAt = currentTime;
    }
    if (tableName == 'ArticlesUnpublished' && metadata.CreatedAt == undefined) {
      metadata.CreatedAt = currentTime;
    }
    if (metadata.UpdatedAt == undefined) {
      metadata.UpdatedAt = null;
    }

    // Adding the body to S3
    if (!(await Articles.addToS3(tableName, metadata, body))) {
      return { status: 500, response: { message: 'server error' } };
    }

    // Adding the articles to the database
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: marshall(metadata),
    };

    try {
      await client.send(new PutItemCommand(params));
      return { status: 200, response: { message: 'item added succesfully' } };
    } catch (err: any) {
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static async publishArticle(id: string) {
    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }

    if (!this.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    const getResponse = await this.getArticle(id, 'ArticlesUnpublished');
    if (getResponse.status != 200) {
      return getResponse;
    }
    const getRespItems = getResponse.response.return;
    delete getRespItems.metadata.ID;

    const addResponse = await this.createArticle(
      'ArticlesPublished',
      getRespItems.metadata,
      getRespItems.body,
      id
    );
    if (addResponse.status != 200) {
      return addResponse;
    }

    const removeResponse = await this.removeArticle('ArticlesUnpublished', id);
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    return { status: 200, response: { message: 'item published succesfully' } };
  }

  public static async removeArticle(tableName: string, id: string) {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }

    if (!this.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    const params = {
      TableName: tableName,
      Key: {
        ID: { S: id },
      },
    };

    try {
      await client.send(new DeleteItemCommand(params));
      if (!(await this.removeFromS3(tableName, id))) {
        return { status: 500, response: { message: 'server error' } };
      }
      return { status: 200, response: { message: 'item deleted succesfuly' } };
    } catch {
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static async updateArticle(
    tableName: string,
    metadata: any,
    body: any
  ) {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (typeof metadata.ID != 'string') {
      return {
        status: 400,
        response: { message: 'missing or invalid ID parameter' },
      };
    }

    if (typeof body !== 'string') {
      return { status: 400, response: { message: 'invalid body data type' } };
    }

    metadata.UpdatedAt = Math.floor(new Date().getTime() / 1000);

    const { ID, ...article } = metadata;

    if (!(await this.validateArticle(article, tableInfo.item))) {
      console.log(article);
      return { status: 400, response: { message: 'invalid metadata format' } };
    }

    const removeResponse = await this.removeArticle(tableName, ID);
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    const addResponse = await this.createArticle(tableName, article, body, ID);
    if (addResponse.status != 200) {
      return addResponse;
    }

    return { status: 200, response: { message: 'item eddited succesfully' } };
  }

  public static async getPaginationItems(
    tableName: string,
    page: number,
    limit: number,
    params: any
  ) {
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (Number.isNaN(limit) || Number.isNaN(page)) {
      return {
        status: 400,
        response: { message: 'missing or invalid limit or page value' },
      };
    }

    if (limit < 1 || page < 1) {
      return {
        status: 400,
        response: { message: 'invalid limit or page number range' },
      };
    }

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
        return { status: 200, response: { return: items } };
      }
    }
  }

  public static async getCategoryCreated(
    tableName: string,
    category: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'PrimaryCategoryCreated',
      KeyConditionExpression: 'PrimaryCategory = :c',
      ExpressionAttributeValues: {
        ':c': { S: category },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getCategoryDifficulty(
    tableName: string,
    category: string,
    difficulty: string,
    page: number,
    limit: number
  ): Promise<any | void> {
    if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return { status: 400, response: { message: 'invalid difficulty value' } };
    }

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'PrimaryCategoryDifficulty',
      KeyConditionExpression: 'PrimaryCategory = :c AND Difficulty = :d',
      ExpressionAttributeValues: {
        ':c': { S: category },
        ':d': { S: difficulty },
      },
      Limit: limit,
      ScanIndexForward: false,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getCategoryRating(
    tableName: string,
    category: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'PrimaryCategoryRating',
      KeyConditionExpression: 'PrimaryCategory = :c',
      ExpressionAttributeValues: {
        ':c': { S: category },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getAuthorCreated(
    tableName: string,
    author: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    if (author == undefined) {
      return { status: 400, response: { message: 'missing author value' } };
    }

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'AuthorCreated',
      KeyConditionExpression: 'Author = :c',
      ExpressionAttributeValues: {
        ':c': { S: author },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getAuthorRating(
    tableName: string,
    author: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    if (author == undefined) {
      return { status: 400, response: { message: 'missing author value' } };
    }

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'AuthorRating',
      KeyConditionExpression: 'Author = :c',
      ExpressionAttributeValues: {
        ':c': { S: author },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getTitleRating(
    tableName: string,
    title: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    if (title == undefined) {
      return { status: 400, response: { message: 'missing title value' } };
    }

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'TitleRating',
      KeyConditionExpression: 'Title = :c',
      ExpressionAttributeValues: {
        ':c': { S: title },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }

  public static async getTitleCreated(
    tableName: string,
    title: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    if (title == undefined) {
      return { status: 400, response: { message: 'missing title value' } };
    }

    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'TitleCreated',
      KeyConditionExpression: 'Title = :c',
      ExpressionAttributeValues: {
        ':c': { S: title },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(tableName, page, limit, params);
  }
}
