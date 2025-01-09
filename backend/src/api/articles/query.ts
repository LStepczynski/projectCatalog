import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';

import { SuccessResponse } from '@type/successResponse';
import { PrivateArticle, PublicArticle } from '@type/article';

import { authenticate, role } from '@utils/middleware';
import { asyncHandler } from '@utils/asyncHandler';
import { UserError } from '@utils/statusError';

import { validGetBody } from '@api/articles/utils/validGetBody';

import { ArticleCrud } from '@services/articleCrud';
import { categories } from '@config/categories';
import { stringToBoolean } from '@utils/stringToBoolean';

dotenv.config();

const router = Router();

/**
 * @route GET articles/get
 * @middleware authenticate(false)
 * @async
 *
 * Fetches an article's metadata and body based on its visibility and ID.
 *
 * @param {Object} req.body - The request body.
 * @param {string} req.body.id - The ID of the article to fetch.
 * @param {string} req.body.visibility - The visibility of the article (e.g., "public" or "private").
 *
 * @throws {UserError} 400 - If the request structure is invalid.
 * @throws {UserError} 404 - If the article is not found.
 * @throws {UserError} 401 - If the user is not authenticated (for private articles).
 * @throws {UserError} 403 - If the user does not have permission to view the article.
 *
 * @response {200} - Article successfully fetched.
 * @response {400} - Invalid request structure.
 * @response {404} - Article not found.
 * @response {401} - Authentication required for private articles.
 * @response {403} - Permission denied for private articles.
 *
 * @returns {SuccessResponse<{metadata: PublicArticle | PrivateArticle, body: string}>}
 * The fetched article's metadata and body.
 */
router.get(
  '/get/:id',
  authenticate(false),
  asyncHandler(async (req: Request, res: Response) => {
    const request: Record<string, any> = {
      id: req.params.id,
    };

    // Conditionally add 'visibility' if it's not undefined
    if (req.query.visibility !== undefined) {
      request.visibility = req.query.visibility;
    }

    // Validate request
    if (!validGetBody(request)) {
      throw new UserError(
        'Missing or invalid visibility query parameter.',
        400
      );
    }

    const table = ArticleCrud.visibilityToTable(request.visibility);

    const articleMetadata = await ArticleCrud.getMetadata(request.id, table);
    if (articleMetadata == null) {
      throw new UserError('Article not found', 404);
    }

    // Check if user can read a private article
    if (request.visibility == 'private') {
      // Check if user is logged in
      if (!req.user) {
        throw new UserError('Please sign-in to view private articles.', 401);
      }
      // Check if user is the owner
      if (req.user.username != articleMetadata.author) {
        // Check if user is an admin
        if (!req.user.roles.includes('admin')) {
          throw new UserError('Invalid Permission', 403);
        }
      }
    }

    const articleBody = await ArticleCrud.getBody(request.id, table);

    const response: SuccessResponse<{
      metadata: PublicArticle | PrivateArticle;
      body: string;
    }> = {
      status: 'success',
      statusCode: 200,
      data: {
        metadata: articleMetadata,
        body: articleBody,
      },
      message: 'Article fetched successfuly.',
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route GET articles/category/:category
 * @middleware authenticate(false)
 *
 * Fetches articles from a specified category with optional pagination and filtering by private or public status.
 *
 * @description Retrieves articles based on the provided category and optional query parameters for pagination, sorting order, and private/public filtering. Ensures only authorized users can access private articles.
 *
 * @param {string} category - The category to fetch articles from.
 * @query {boolean} [private=false] - Indicates whether to fetch private articles. Defaults to `false`.
 * @query {number} [page=1] - The page number to retrieve (1-based indexing).
 * @query {boolean} [scanForward=true] - Sorting order for the articles. `true` for ascending and `false` for descending.
 *
 * @throws {UserError} 400 - If the `page` query parameter is invalid.
 * @throws {UserError} 403 - If attempting to access private articles without proper authorization.
 * @throws {UserError} 404 - If the specified category does not exist.
 * @throws {InternalError} 500 - If there is an error fetching articles from the database.
 *
 * @response {200} - Returns a list of articles in the specified category.
 * @response {200.data} {PublicArticle[] | PrivateArticle[]} - Array of articles from the specified category.
 */
router.get(
  '/category/:category',
  authenticate(false),
  asyncHandler(async (req: Request, res: Response) => {
    const privateArticle = stringToBoolean(req.query.private) || false;
    let scanForward = stringToBoolean(req.query.scanForward);
    if (scanForward == null) scanForward = true;

    const category = req.params.category;
    const page = Number(req.query.page) || 1;

    // Check if page is a number bigger than 0
    if (isNaN(page) || page < 1) {
      throw new UserError('Invalid page parameter.');
    }

    // Check if user is an admin if they want to view private articles
    if (privateArticle && !req.user?.roles.includes('admin')) {
      throw new UserError('Access denied.', 403);
    }

    // Check if the category is valid
    if (!categories.includes(category)) {
      throw new UserError('Category not found', 404);
    }

    // Request params
    const params = {
      TableName: privateArticle
        ? ArticleCrud.UNPUBLISHED_TABLE_NAME
        : ArticleCrud.PUBLISHED_TABLE_NAME,
      IndexName: privateArticle
        ? 'CategoryCreatedAtIndex'
        : 'CategoryPublishedAtIndex',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': { S: category },
      },
      Limit: 10,
      ScanIndexForward: scanForward,
    };

    // Send the request and return the data
    const articles = await ArticleCrud.getPagination(page, params);

    const response: SuccessResponse<PublicArticle[] | PrivateArticle[]> = {
      status: 'success',
      data: articles,
      message: 'Articles successfully fetched.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route GET articles/author/:authorName
 * @middleware authenticate(false)
 *
 * Fetches articles by a specified author with optional pagination and filtering by private or public status.
 *
 * @description Retrieves articles written by the specified author, using query parameters for pagination, sorting order,
 * and private/public filtering. Ensures only authorized users can access private articles.
 *
 * @param {string} authorName - The name of the author whose articles are being requested.
 * @query {boolean} [private=false] - Indicates whether to fetch private articles. Defaults to `false`.
 * @query {number} [page=1] - The page number to retrieve (1-based indexing).
 * @query {boolean} [scanForward=true] - Sorting order for the articles. `true` for ascending and `false` for descending.
 *
 * @throws {UserError} 400 - If the `page` query parameter is invalid.
 * @throws {UserError} 403 - If attempting to access private articles without proper authorization.
 * @throws {InternalError} 500 - If there is an error fetching articles from the database.
 *
 * @response {200} - Returns a list of articles by the specified author.
 * @response {200.data} {PublicArticle[] | PrivateArticle[]} - Array of articles by the specified author.
 */
router.get(
  '/author/:authorName',
  authenticate(false),
  asyncHandler(async (req: Request, res: Response) => {
    const privateArticle = stringToBoolean(req.query.private) || false;
    let scanForward = stringToBoolean(req.query.scanForward);
    if (scanForward == null) scanForward = true;

    const authorName = req.params.authorName;
    const page = Number(req.query.page) || 1;

    // Check if page is a number bigger than 0
    if (isNaN(page) || page < 1) {
      throw new UserError('Invalid page parameter.');
    }

    // Check if user can view private articles
    if (
      privateArticle &&
      !(req.user?.roles.includes('admin') || req.user?.username === authorName)
    ) {
      throw new UserError('Access denied.', 403);
    }

    // Request params
    const params = {
      TableName: privateArticle
        ? ArticleCrud.UNPUBLISHED_TABLE_NAME
        : ArticleCrud.PUBLISHED_TABLE_NAME,
      IndexName: privateArticle
        ? 'AuthorCreatedAtIndex'
        : 'AuthorPublishedAtIndex',
      KeyConditionExpression: 'author = :author',
      ExpressionAttributeValues: {
        ':author': { S: authorName },
      },
      Limit: 10,
      ScanIndexForward: scanForward,
    };

    // Send the request and return the data
    const articles = await ArticleCrud.getPagination(page, params);

    const response: SuccessResponse<PublicArticle[] | PrivateArticle[]> = {
      status: 'success',
      data: articles,
      message: 'Articles successfully fetched.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route GET articles/private
 * @middleware authenticate, role(['admin'])
 *
 * Fetches private articles from the database with optional pagination and sorting.
 *
 * @description Retrieves articles from the unpublished table filtered by their status and supports pagination and sorting order. Only accessible to admin users.
 *
 * @query {string} [status='Private'] - The status of the articles to fetch. Must be either `'Private'` or `'In Review'`.
 * @query {number} [page=1] - The page number to retrieve (1-based indexing).
 * @query {boolean} [scanForward=true] - Sorting order for the articles. `true` for ascending and `false` for descending.
 *
 * @throws {UserError} 400 - If the `page` query parameter is invalid.
 * @throws {UserError} 400 - If the `status` query parameter is invalid.
 * @throws {InternalError} 500 - If there is an error fetching articles from the database.
 *
 * @response {200} - Returns a list of private articles matching the specified filters.
 * @response {200.data} {PublicArticle[] | PrivateArticle[]} - Array of articles with the specified status.
 */

router.get(
  '/private',
  authenticate(),
  role(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    let scanForward = stringToBoolean(req.query.scanForward);
    if (scanForward == null) scanForward = true;

    const status =
      typeof req.query.status === 'string' ? req.query.status : 'Private';
    const page = Number(req.query.page) || 1;

    // Check if page is a number bigger than 0
    if (isNaN(page) || page < 1) {
      throw new UserError('Invalid page parameter.');
    }

    // Check if status is valid
    if (!['Private', 'In Review'].includes(status)) {
      throw new UserError('Invalid status value.');
    }

    // Request params
    const params = {
      TableName: ArticleCrud.UNPUBLISHED_TABLE_NAME,
      IndexName: 'StatusCreatedAtIndex',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': { S: status },
      },
      Limit: 10,
      ScanIndexForward: scanForward,
    };

    // Send the request and return the data
    const articles = await ArticleCrud.getPagination(page, params);

    const response: SuccessResponse<PrivateArticle[]> = {
      status: 'success',
      data: articles,
      message: 'Articles successfuly fetched.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
