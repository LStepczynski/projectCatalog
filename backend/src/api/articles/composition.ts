import { Router, Request, Response } from 'express';

import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

import { SuccessResponse } from '@type/successResponse';
import { PrivateArticle, PublicArticle } from '@type/article';

import { authenticate, role } from '@utils/middleware';
import { asyncHandler } from '@utils/asyncHandler';
import { UserError } from '@utils/statusError';

import { validCreateMetadata } from '@api/articles/utils/validCreateMetadata';
import { validDeleteMetadata } from '@api/articles/utils/validDeleteMetadata';

import { ArticleCrud } from '@services/articleCrud';
import { ErrorResponse } from '@type/errorResponse';

dotenv.config();

const router = Router();

/**
 * @route POST articles/create
 * @middleware authenticate
 * @middleware role(['admin', 'publisher'])
 * @async
 *
 * @TODO: Test the role middleware
 *
 * Creates a new article with provided metadata and body.
 *
 * @param {Object} req.body - The request body.
 * @param {Object} req.body.metadata - The metadata of the article.
 * @param {string} req.body.body - The body/content of the article.
 *
 * @throws {UserError} 400 - Missing or invalid article body.
 * @throws {UserError} 400 - Invalid article metadata schema.
 * @throws {UserError} 401 - If the user is not authenticated.
 * @throws {UserError} 403 - If the user does not have the required role.
 *
 * @response {201} - Article created successfully.
 * @response {400} - Validation errors for body or metadata.
 * @response {401} - Authentication required.
 * @response {403} - Insufficient permissions.
 *
 * @returns {SuccessResponse<PrivateArticle>} The newly created article.
 */
router.post(
  '/create',
  authenticate(),
  role(['admin', 'publisher']),
  asyncHandler(async (req: Request, res: Response) => {
    const metadata = req.body.metadata; // Article metadata
    const body = req.body.body; // Article body

    // Validate against the schema
    if (typeof body !== 'string') {
      throw new UserError('Missing or invalid article body', 400);
    }

    if (!validCreateMetadata(metadata)) {
      throw new UserError('Invalid article metadata schema', 400);
    }

    // Fill in article information
    metadata.id = uuid();
    metadata.likes = 0;
    metadata.author = req.user!.username;
    metadata.authorProfilePicture = req.user!.profilePicture;

    const createdArticle: PrivateArticle = await ArticleCrud.create(
      metadata,
      body
    );

    const response: SuccessResponse<PrivateArticle> = {
      status: 'success',
      data: createdArticle,
      message: 'Article created successfuly.',
      statusCode: 201,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route DELETE articles/delete
 * @middleware authenticate
 * @async
 *
 * Deletes an article based on its visibility and ownership.
 *
 * @param {Object} req.body - The request body.
 * @param {string} req.body.id - The ID of the article to delete.
 * @param {string} req.body.visibility - The visibility of the article (e.g., "public" or "private").
 *
 * @throws {UserError} 400 - If the request structure is invalid.
 * @throws {UserError} 404 - If the article is not found.
 * @throws {UserError} 403 - If the user does not have permission to delete the article.
 * @throws {UserError} 401 - If the user is not authenticated.
 *
 * @response {200} - Article successfully deleted.
 * @response {400} - Invalid request structure.
 * @response {404} - Article not found.
 * @response {403} - Permission denied.
 *
 * @returns {SuccessResponse<PrivateArticle | PublicArticle>} The deleted article's metadata.
 */
router.delete(
  '/delete',
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    if (!validDeleteMetadata(req.body)) {
      throw new UserError('Invalid request structure', 400);
    }

    // Fetch the article
    const tableName = ArticleCrud.visibilityToTable(req.body.visibility);
    const articleToDelete = await ArticleCrud.getMetadata(
      req.body.id,
      tableName
    );

    // Raise an error if the article does not exist
    if (articleToDelete === null) {
      throw new UserError('Article not found', 404);
    }

    // Check permission for deletion
    const isAdmin = req.user!.roles.includes('admin');
    const isOwner = req.user!.username === articleToDelete.author;
    if (isAdmin || isOwner) {
      await ArticleCrud.delete(req.body.id, tableName);

      // Send a response
      const response: SuccessResponse<PrivateArticle | PublicArticle> = {
        status: 'success',
        statusCode: 200,
        data: articleToDelete,
        message: 'Item successfuly deleted',
      };

      res.status(response.statusCode).send(response);
    } else {
      // Send a response
      const response: ErrorResponse = {
        status: 'error',
        statusCode: 403,
        data: null,
        message: 'Permission denied',
      };

      res.status(response.statusCode).send(response);
    }
  })
);

export default router;
