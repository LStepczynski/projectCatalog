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

interface ApiResponse {
  status: number;
  response: {
    [key: string]: any;
  };
}

type TableReturn = Table | false;
export class Articles {
  // Article schema for each table
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
        Rating: { value: 0, required: false },
        CreatedAt: { value: 0, required: false },
        UpdatedAt: { value: 0, required: false },
        Difficulty: { value: '', required: true },
        Image: { value: '', required: false },
        Status: { value: '', required: false },
      },
    },
  ];

  /**
   * Finds a table schema from its name
   *
   * @public
   * @static
   * @param {string} name
   * @returns {TableReturn}
   */
  public static findTable(name: string): TableReturn {
    // Iterate over the tables and check the name
    for (const tableName of Articles.TABLE_NAMES) {
      if (name === tableName.tableName) {
        return tableName;
      }
    }
    return false;
  }

  /**
   * Accepts an article and a model and validates if they are of the same format
   *
   * @public
   * @static
   * @async
   * @param {Dictionary} article - Article for testing
   * @param {Dictionary} model - shema
   * @returns {boolean} - result
   */
  public static validateArticle(article: Dictionary, model: Dictionary): boolean {
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

  /**
   * Fetches an article from S3 and returns it
   *
   * @public
   * @static
   * @async
   * @param {string} articleId - article id
   * @param {string} tableName - table name of an article
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getArticle(
    articleId: string,
    tableName: string
  ): Promise<ApiResponse> {
    // Validate the table name
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    // Validate the article id
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

    // Fetch and return article
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

  /**
   * Fetches an article metadata from the database
   *
   * @public
   * @static
   * @async
   * @param {string} articleId - article id
   * @param {string} tableName - table name of an article
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getArticleMetadata(
    articleId: string,
    tableName: string
  ): Promise<ApiResponse> {
    // Validate table name
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    // Validate article id
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

    // Fetch and return article metadata
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

  /**
   * Creates an article and adds it to the database and S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - name of the table the article will be added to
   * @param {*} metadata - metadata of the article
   * @param {string} body - body of the article
   * @param {string} [id=''] - id under which the article will be saved as
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async createArticle(
    tableName: string,
    metadata: any,
    body: string,
    id: string = ''
  ): Promise<ApiResponse> {
    const tableInfo: TableReturn = this.findTable(tableName);

    // Validations
    if (tableInfo == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    if (!this.validateArticle(metadata, tableInfo.item)) {
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

    // If added to ArticlesPublished
    // Sets rating to zero
    // Sets PublishedAt to current time if not provided
    if (tableName == 'ArticlesPublished') {
      if (metadata.PublishedAt == undefined) {
        metadata.PublishedAt = currentTime;
      }
      metadata.Rating = 0;
    }

    // If added to ArticlesUnpublished
    // Sets CreatedAt to current time if not provided
    // Sets Status to private if not provided
    if (tableName == 'ArticlesUnpublished') {
      if (metadata.CreatedAt == undefined) {
        metadata.CreatedAt = currentTime;
      }
      if (!metadata.Status || metadata.Status == '') {
        metadata.Status = 'private';
      }
    }

    // Sets UpdatedAt and Image to null if not provided
    if (metadata.UpdatedAt == undefined) {
      metadata.UpdatedAt = null;
    }
    if (metadata.Image == '' || metadata.Image == undefined) {
      metadata.Image = null;
    }

    // Adding the articles to the database
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: marshall(metadata),
    };

    try {
      // Add metadata to the database
      await client.send(new PutItemCommand(params));

      // Remove fields that are not meant to be added to S3
      delete metadata.rating;
      delete metadata.AuthorProfilePic

      // Add the whole article to the S3
      if (!(await S3.addToS3(tableName, metadata, body))) {
        return { status: 500, response: { message: 'server error' } };
      }
      return {
        status: 200,
        response: { message: 'item added succesfully', id: metadata.ID },
      };
    } catch (err: any) {
      return { status: 500, response: { message: 'server error' } };
    }
  }

  /**
   * Moves an article from ArticlesUnpublished to ArticlesPublished
   *
   * @public
   * @static
   * @async
   * @param {string} id - id of the article that will be moved
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async publishArticle(id: string): Promise<ApiResponse> {
    // Validations
    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }
    if (!Helper.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    // Fetch the article metadata from the database
    const metadataResp = await this.getArticleMetadata(id, 'ArticlesUnpublished');
    if (metadataResp.status != 200) {
      return metadataResp;
    }

    // Fetch the whole article from the S3
    const bodyResp = await this.getArticle(id, 'ArticlesUnpublished');
    if (bodyResp.status != 200) {
      return bodyResp;
    }

    // Combine the metadata from the database with the body from the S3 into a new object
    const getRespItems = {body: bodyResp.response.return.body, metadata: metadataResp.response.return};

    // Remove fields that are not needed
    delete getRespItems.metadata.ID;
    delete getRespItems.metadata.Status;

    // Create the article in the ArticlesPublished table
    const addResponse = await this.createArticle(
      'ArticlesPublished',
      getRespItems.metadata,
      getRespItems.body,
      id
    );
    if (addResponse.status != 200) {
      return addResponse;
    }

    // Remove the article from ArticlesUnpublished
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

  /**
   * Moves an article from ArticlesPublished to ArticlesUnpublished
   *
   * @public
   * @static
   * @async
   * @param {string} id - id of the article that will be moved
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async hideArticle(id: string): Promise<ApiResponse> {
    // Validations
    if (typeof id !== 'string') {
      return { status: 400, response: { message: 'invalid id data type' } };
    }
    if (!Helper.isValidUUID(id)) {
      return { status: 400, response: { message: 'invalid id format' } };
    }

    // Fetch the article metadata from the database
    const metadataResp = await this.getArticleMetadata(id, 'ArticlesPublished');
    if (metadataResp.status != 200) {
      return metadataResp;
    }

    // Fetch the whole article from the S3
    const bodyResp = await this.getArticle(id, 'ArticlesPublished');
    if (bodyResp.status != 200) {
      return bodyResp;
    }

    // Combine the metadata from the database with the body from the S3 into a new object
    const getRespItems = {body: bodyResp.response.return.body, metadata: metadataResp.response.return};

    // Remove fields that are not needed
    delete getRespItems.metadata.ID;
    delete getRespItems.metadata.PublishedAt;

    // Create the article in the ArticlesUnpublished table
    const addResponse = await this.createArticle(
      'ArticlesUnpublished',
      getRespItems.metadata,
      getRespItems.body,
      id
    );
    if (addResponse.status != 200) {
      return addResponse;
    }

    // Remove the article from ArticlesPublished
    const removeResponse = await this.removeArticle(
      'ArticlesPublished',
      id,
      false
    );
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    return { status: 200, response: { message: 'item hidden succesfully' } };
  }

  /**
   * Removes an article from a table and S3
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - name of the table the article will be removed from
   * @param {string} id - id of the article for removal
   * @param {boolean} [removeImage=true] - value that determines if the image of the article will be removed from S3
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async removeArticle(
    tableName: string,
    id: string,
    removeImage: boolean = true
  ): Promise<ApiResponse> {
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
      // Remove article from the database
      const response = await client.send(new DeleteItemCommand(params));

      if (!response.Attributes) {
        return { status: 404, response: { message: 'item not found' } };
      }

      // Remove article from S3
      if (!(await S3.removeArticleFromS3(tableName, id))) {
        return { status: 500, response: { message: 'server error' } };
      }

      const returnItem = unmarshall(response.Attributes);

      // remove the image from S3
      if (removeImage && returnItem.Image != null) {
        // extract image uuid and remove it
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

  /**
   * Replace an article
   * MIGHT NOT BE NEEDED
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name of the article for replacement
   * @param {*} metadata - metadata of the new article
   * @param {string} body - body of the new article
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async updateArticle(
    tableName: string,
    metadata: any,
    body: string
  ): Promise<ApiResponse> {
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

    // Set the UpdatedAt field to current time
    metadata.UpdatedAt = Helper.getUNIXTimestamp();

    // Extract the id from the article and test it against the schema
    const { ID, ...article } = metadata;
    if (! this.validateArticle(article, tableInfo.item)) {
      return { status: 400, response: { message: 'invalid metadata format' } };
    }

    // Remove the article
    const removeResponse = await this.removeArticle(tableName, ID);
    if (removeResponse.status != 200) {
      return removeResponse;
    }

    // Add the article
    const addResponse = await this.createArticle(tableName, article, body, ID);
    if (addResponse.status != 200) {
      return addResponse;
    }

    return { status: 200, response: { message: 'item eddited succesfully' } };
  }

  /**
   * Changes the value of one field of the article
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name of the article for editing
   * @param {string} id - id of the article for editing
   * @param {string} itemKey - name of the field for editing
   * @param {*} itemValue - new value of the field
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async patchArticle(
    tableName: string,
    id: string,
    itemKey: string,
    itemValue: any
  ): Promise<ApiResponse> {
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

    // Check if the key to change is stored only in the database
    const dbOnlyKeys = ['Rating', 'AuthorProfilePic']
    const isDbOnly = dbOnlyKeys.includes(itemKey)

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
      // Update the article in the database 
      if (itemKey != 'body') {
        const data = await client.send(new UpdateItemCommand(params));

        if (!data.Attributes) {
          return { status: 404, response: { message: 'item not found' } };
        }
      }

      // Update the article in the S3
      if (!isDbOnly) {
        let article = await S3.readFromS3(tableName, id);
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
      }

      return {
        status: 200,
        response: {
          message: 'item updated successfully',
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

  /**
   * Function that fetches items from a table using pagination from the 
   * inputed params
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name
   * @param {number} page - page of the pagination
   * @param {number} limit - objects per page
   * @param {*} params - database request params
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getPaginationItems(
    tableName: string,
    page: number,
    limit: number,
    params: any
  ): Promise<ApiResponse> {
    if (this.findTable(tableName) == false) {
      return { status: 400, response: { message: 'table not found' } };
    }

    // Validations
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
        return { status: 200, response: { return: items } };
      }
    }
  }

  /**
   * Fetches articles with pagination based on status and creation date
   *
   * @public
   * @static
   * @async
   * @param {string} status - status value
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getStatusCreated(
    status: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
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

  /**
   * Fetches articles with pagination based on category and creation date
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} category - category of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getCategoryCreated(
    tableName: string,
    category: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
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

  /**
   * Fetches articles with pagination based on category and difficulty
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} category - category of the articles
   * @param {string} difficulty - difficulty of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getCategoryDifficulty(
    tableName: string,
    category: string,
    difficulty: string,
    page: number,
    limit: number
  ): Promise<ApiResponse> {
    // Validation
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

  /**
   * Fetches articles with pagination based on category and rating
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} category - category of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getCategoryRating(
    tableName: string,
    category: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
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

  /**
   * Fetches articles with pagination based on author and creation date
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} author - author of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getAuthorCreated(
    tableName: string,
    author: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
    // Validations
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

  /**
   * Fetches articles with pagination based on author and rating
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} author - author of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getAuthorRating(
    tableName: string,
    author: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
    // Validations
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

  /**
   * Fetches articles with pagination based on title and rating
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} title - title of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getTitleRating(
    tableName: string,
    title: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
    // Validations
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

  /**
   * Fetches articles with pagination based on title and creation date
   *
   * @public
   * @static
   * @async
   * @param {string} tableName - table name to query
   * @param {string} title - title of the articles
   * @param {number} page - page
   * @param {number} limit - articles per page
   * @param {boolean} forward - query articles in normal or reversed order 
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async getTitleCreated(
    tableName: string,
    title: string,
    page: number,
    limit: number,
    forward: boolean
  ): Promise<ApiResponse> {
    // Validations
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

  /**
   * Increments the rating of an article
   *
   * @public
   * @static
   * @async
   * @param {string} id - id of the article
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async incrementRating(id: string): Promise<ApiResponse> {
    const params: UpdateItemCommandInput = {
      TableName: 'ArticlesPublished',
      Key: {
        ID: { S: id },
      },
      UpdateExpression: 'SET #r = if_not_exists(#r, :start) + :inc',
      ExpressionAttributeNames: {
        '#r': 'Rating',
      },
      ExpressionAttributeValues: {
        ':inc': { N: '1' },
        ':start': { N: '0' }, // Start value if 'Rating' doesn't exist
      },
      ReturnValues: 'UPDATED_NEW',
    };

    try {
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

  /**
   * Decrements the rating of an article
   *
   * @public
   * @static
   * @async
   * @param {string} id - id of the article
   * @returns {Promise<ApiResponse>} - api response
   */
  public static async decrementRating(id: string): Promise<ApiResponse> {
    const params: UpdateItemCommandInput = {
      TableName: 'ArticlesPublished',
      Key: {
        ID: { S: id },
      },
      UpdateExpression: 'SET #r = if_not_exists(#r, :start) + :dec',
      ExpressionAttributeNames: {
        '#r': 'Rating',
      },
      ExpressionAttributeValues: {
        ':dec': { N: '-1' },
        ':start': { N: '0' }, // Start value if 'Rating' doesn't exist
      },
      ReturnValues: 'UPDATED_NEW',
    };

    try {
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
