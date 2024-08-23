import {
  GetItemCommand,
  PutItemCommand,
  PutItemCommandInput,
  DeleteItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  QueryCommandInput,
  QueryCommand,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';

import { client } from './dynamodb';
import { S3 } from './s3';

import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

import { v4 as uuidv4 } from 'uuid';
import { Helper } from './helper';

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
        AuthorProfilePic: { value: '', required: true },
        PrimaryCategory: { value: '', required: true },
        SecondaryCategories: { value: [], required: true },
        Rating: { value: 0, required: true },
        CreatedAt: { value: 0, required: true },
        UpdatedAt: { value: 0, required: false },
        PublishedAt: { value: 0, required: false },
        Difficulty: { value: '', required: true },
        Image: { value: '', required: false },
      },
    },
    {
      tableName: 'ArticlesUnpublished',
      item: {
        Title: { value: '', required: true },
        Description: { value: '', required: true },
        Author: { value: '', required: true },
        AuthorProfilePic: { value: '', required: true },
        PrimaryCategory: { value: '', required: true },
        SecondaryCategories: { value: [], required: true },
        Rating: { value: 0, required: true },
        CreatedAt: { value: 0, required: false },
        UpdatedAt: { value: 0, required: false },
        Difficulty: { value: '', required: true },
        Image: { value: '', required: false },
        Status: { value: '', required: false },
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

      if ((isEmpty && isRequired) || (!isSameType && isRequired)) {
        console.log(field);
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
      const response = await S3.readFromS3(tableName, articleId);
      if (response == undefined) {
        return { status: 404, response: { message: 'item not found' } };
      }

      return { status: 200, response: { return: response } };
    } catch (err) {
      console.log(err);
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static async getArticleMetadata(
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

    const params = {
      TableName: tableName,
      Key: {
        ID: { S: articleId },
      },
    };

    try {
      const response = await client.send(new GetItemCommand(params));
      if (!response.Item) {
        return { status: 404, response: { message: 'item not found' } };
      }

      return { status: 200, response: { return: unmarshall(response.Item) } };
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
    if (!Helper.isValidUUID(id)) {
      metadata.ID = uuidv4();
    } else {
      metadata.ID = id;
    }
    const currentTime = Helper.getUNIXTimestamp();

    if (tableName == 'ArticlesPublished' && metadata.PublishedAt == undefined) {
      metadata.PublishedAt = currentTime;
    }
    if (tableName == 'ArticlesUnpublished') {
      if (metadata.CreatedAt == undefined) {
        metadata.CreatedAt = currentTime;
      }
      if (!metadata.Status || metadata.Status == '') {
        metadata.Status = 'private';
      }
    }
    if (metadata.UpdatedAt == undefined) {
      metadata.UpdatedAt = null;
    }

    if (metadata.Image == '' || metadata.Image == undefined) {
      metadata.Image = null;
    }

    // Adding the body to S3
    if (!(await S3.addToS3(tableName, metadata, body))) {
      return { status: 500, response: { message: 'server error' } };
    }

    // Adding the articles to the database
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: marshall(metadata),
    };

    try {
      await client.send(new PutItemCommand(params));
      return {
        status: 200,
        response: { message: 'item added succesfully', id: metadata.ID },
      };
    } catch (err: any) {
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static async publishArticle(id: string) {
    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }

    if (!Helper.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    const getResponse = await this.getArticle(id, 'ArticlesUnpublished');
    if (getResponse.status != 200) {
      return getResponse;
    }
    const getRespItems = getResponse.response.return;
    delete getRespItems.metadata.ID;
    delete getRespItems.metadata.Status;

    const addResponse = await this.createArticle(
      'ArticlesPublished',
      getRespItems.metadata,
      getRespItems.body,
      id
    );
    if (addResponse.status != 200) {
      return addResponse;
    }

    const removeResponse = await this.removeArticle(
      'ArticlesUnpublished',
      id,
      false
    );
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    return { status: 200, response: { message: 'item published succesfully' } };
  }

  public static async hideArticle(id: string) {
    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }

    if (!Helper.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    const getResponse = await this.getArticle(id, 'ArticlesPublished');
    if (getResponse.status != 200) {
      return getResponse;
    }
    const getRespItems = getResponse.response.return;
    delete getRespItems.metadata.ID;
    delete getRespItems.metadata.PublishedAt;
    getRespItems.metadata.Status = 'private';

    const addResponse = await this.createArticle(
      'ArticlesUnpublished',
      getRespItems.metadata,
      getRespItems.body,
      id
    );
    if (addResponse.status != 200) {
      return addResponse;
    }

    const removeResponse = await this.removeArticle(
      'ArticlesPublished',
      id,
      false
    );
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    return { status: 200, response: { message: 'item hid succesfully' } };
  }

  public static async removeArticle(
    tableName: string,
    id: string,
    removeImage: boolean = true
  ) {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }

    if (!Helper.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    const params = {
      TableName: tableName,
      Key: {
        ID: { S: id },
      },
      ReturnValues: ReturnValue.ALL_OLD,
    };

    try {
      const response = await client.send(new DeleteItemCommand(params));

      if (!response.Attributes) {
        return { status: 404, response: { message: 'item not found' } };
      }

      if (!(await S3.removeArticleFromS3(tableName, id))) {
        return { status: 500, response: { message: 'server error' } };
      }

      const returnItem = unmarshall(response.Attributes);
      if (removeImage && returnItem.Image != null) {
        const regex =
          /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
        const match = returnItem.Image.match(regex);
        const imageId = match ? match[0] : null;

        await S3.removeImageFromS3(imageId);
      }

      return { status: 200, response: { message: 'item deleted succesfuly' } };
    } catch (err) {
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

    metadata.UpdatedAt = Helper.getUNIXTimestamp();

    const { ID, ...article } = metadata;

    if (!(await this.validateArticle(article, tableInfo.item))) {
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

  public static async patchArticle(
    tableName: string,
    id: string,
    itemKey: string,
    itemValue: any
  ) {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }
    if (!id || !itemKey || itemValue == undefined) {
      return {
        status: 400,
        response: { message: 'id, key, or value not provided' },
      };
    }

    let article = S3.readFromS3(tableName, id);
    if (!article) {
      return { status: 404, response: { message: 'item not found' } };
    }
    if (itemKey == 'body') {
      article.body = itemValue;
    } else {
      article.metadata[itemKey] = itemValue;
    }
    if (!(await S3.addToS3(tableName, article.metadata, article.body))) {
      return { status: 500, response: { message: 'server error' } };
    }

    const params: UpdateItemCommandInput = {
      TableName: tableName,
      Key: {
        ID: { S: id },
      },
      UpdateExpression: `set #prop = :value`,
      ExpressionAttributeNames: {
        '#prop': itemKey,
      },
      ExpressionAttributeValues: {
        ':value': { S: itemValue },
      },
      ReturnValues: 'UPDATED_NEW',
      ConditionExpression: 'attribute_exists(ID)',
    };

    try {
      const data = await client.send(new UpdateItemCommand(params));

      if (!data.Attributes) {
        return { status: 404, response: { message: 'item not found' } };
      }

      return {
        status: 200,
        response: {
          message: 'item updated successfully',
          return: data.Attributes,
        },
      };
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') {
        return { status: 404, response: { message: 'item not found' } };
      }

      console.error('Unable to update item. Error:', err);
      return { status: 500, response: { message: 'server error' } };
    }
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

  public static async getStatusCreated(
    status: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<any | void> {
    const params: QueryCommandInput = {
      TableName: 'ArticlesUnpublished',
      IndexName: 'StatusCreated',
      KeyConditionExpression: '#status = :c',
      ExpressionAttributeNames: {
        '#status': 'Status',
      },
      ExpressionAttributeValues: {
        ':c': { S: status },
      },
      Limit: limit,
      ScanIndexForward: forward,
    };
    return await this.getPaginationItems(
      'ArticlesUnpublished',
      page,
      limit,
      params
    );
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

  public static async incrementRating(id: string) {
    const params: UpdateItemCommandInput = {
      TableName: 'ArticlesPublished',
      Key: {
        ID: { S: id },
      },
      UpdateExpression: 'ADD #r :inc',
      ExpressionAttributeNames: {
        '#r': 'Rating',
      },
      ExpressionAttributeValues: {
        ':inc': { N: '1' },
      },
      ReturnValues: 'UPDATED_NEW',
    };

    try {
      const article = await S3.readFromS3('ArticlesPublished', id);
      if (!article) {
        return {
          status: 500,
          response: { message: 'server error' },
        };
      }

      article.metadata.Rating += 1;
      if (
        !(await S3.addToS3('ArticlesPublished', article.metadata, article.body))
      ) {
        return {
          status: 500,
          response: { message: 'server error' },
        };
      }

      const data = await client.send(new UpdateItemCommand(params));
      return {
        status: 200,
        response: { message: 'rating incremented succesfully' },
      };
    } catch (err) {
      console.error('Error updating rating:', err);
      return {
        status: 500,
        response: { message: 'server error' },
      };
    }
  }

  public static async decrementRating(id: string) {
    const params: UpdateItemCommandInput = {
      TableName: 'ArticlesPublished',
      Key: {
        ID: { S: id },
      },
      UpdateExpression: 'ADD #r :dec',
      ExpressionAttributeNames: {
        '#r': 'Rating',
      },
      ExpressionAttributeValues: {
        ':dec': { N: '-1' },
      },
      ReturnValues: 'UPDATED_NEW',
      ConditionExpression: 'attribute_exists(#r) OR attribute_not_exists(#r)',
    };

    try {
      const article = await S3.readFromS3('ArticlesPublished', id);
      if (!article) {
        return {
          status: 500,
          response: { message: 'server error' },
        };
      }

      article.metadata.Rating -= 1;
      if (
        !(await S3.addToS3('ArticlesPublished', article.metadata, article.body))
      ) {
        return {
          status: 500,
          response: { message: 'server error' },
        };
      }

      const data = await client.send(new UpdateItemCommand(params));
      return {
        status: 200,
        response: { message: 'rating decremented succesfully' },
      };
    } catch (err) {
      console.error('Error updating rating:', err);
      return {
        status: 500,
        response: { message: 'server error' },
      };
    }
  }
}
