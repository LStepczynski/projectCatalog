import { Router, Request, Response } from 'express';

import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

import { SuccessResponse } from '@type/successResponse';
import { PrivateArticle, PublicArticle } from '@type/article';

import { authenticate, role } from '@utils/middleware';
import { asyncHandler } from '@utils/asyncHandler';
import { UserError } from '@utils/statusError';

import { validCreateBody } from '@api/articles/utils/validCreateBody';
import { validDeleteBody } from '@api/articles/utils/validDeleteBody';

import { ArticleCrud } from '@services/articleCrud';
import { ErrorResponse } from '@type/errorResponse';
import { validUpdateBody } from './utils/validUpdateBody';
import { Likes } from '@services/likes';
import { ArticleService } from '@services/articleService';

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
 * @param {string} req.body.title - The title of the article.
 * @param {string} req.body.description - A short description of the article.
 * @param {string} req.body.category - The category of the article.
 * @param {Array<string>} req.body.tags - Tags associated with the article.
 * @param {string} req.body.image - URL of the article image.
 * @param {string} req.body.difficulty - Difficulty level of the article ('Hard', 'Medium', 'Easy').
 * @param {string} [req.body.status] - Status of the article ('Private', 'In Review').
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
    if (!validCreateBody(req.body)) {
      throw new UserError('Invalid article schema', 400);
    }

    // Fill in article information
    req.body.id = uuid();
    req.body.likes = 0;
    req.body.author = req.user!.username;
    req.body.authorProfilePicture = req.user!.profilePicture;

    const { body, ...metadata } = req.body;

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
  role(['admin', 'publisher']),
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    if (!validDeleteBody(req.body)) {
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

/**
 * Updates an article's metadata after validating the request and permissions.
 * Only the owner of the article or an admin can update the article.
 *
 * @route PUT articles/update
 * @middleware authenticate - Ensures the user is authenticated.
 * @middleware role - Restricts access to users with the 'publisher' role.
 *
 * @throws {UserError} - If the request body is invalid or the article is not found.
 * @throws {ErrorResponse} - If the user does not have permission to update the article.
 * @returns {SuccessResponse<null>} - A success message with HTTP status code 200.
 */
router.put(
  '/update',
  authenticate(),
  role(['publisher']),
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    if (!validUpdateBody(req.body)) {
      throw new UserError('Invalid request structure', 400);
    }

    const { id: idToUpdate, ...newMetadata } = req.body;

    // Fetch the article
    const tableName = ArticleCrud.visibilityToTable('private');
    const articleToUpdate = await ArticleCrud.getMetadata(
      idToUpdate,
      tableName
    );

    // Raise an error if the article does not exist
    if (articleToUpdate === null) {
      throw new UserError('Article not found', 404);
    }

    // Check permission for update
    const isOwner = req.user!.username === articleToUpdate.author;
    if (isOwner) {
      await ArticleCrud.update(idToUpdate, newMetadata);

      // Send a response
      const response: SuccessResponse<null> = {
        status: 'success',
        statusCode: 200,
        data: null,
        message: 'Item successfuly updated.',
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

/**
 * @route GET articles/like/:id
 * @middleware authenticate, role(['verified'])
 *
 * Checks whether the specified article is liked by the authenticated user.
 *
 * @description Validates the article ID as a UUID and determines if the authenticated user has liked the article. Responds with the like status.
 *
 * @param {string} id - The UUID of the article to check.
 * @header {Authorization} - Bearer token for user authentication.
 *
 * @throws {InternalError} 500 - If there is an error interacting with the database.
 *
 * @response {200} - Returns the like status of the article for the user.
 * @response {200.data.isLiked} {boolean} - `true` if the article is liked, `false` otherwise.
 */
router.get(
  '/like/:id',
  authenticate(),
  role(['verified']),
  asyncHandler(async (req: Request, res: Response) => {
    let isLiked = true;

    // Check if the id is a uuid
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.params.id
      );
    if (!isUuid) {
      isLiked = false;
    }

    // Check if the article is liked by the user
    if (isLiked) {
      const likeObject = await Likes.get(req.params.id, req.user!.username);
      if (likeObject == null) {
        isLiked = false;
      }
    }

    const response: SuccessResponse<{ isLiked: boolean }> = {
      status: 'success',
      data: { isLiked },
      message: `Successfuly cheked if the article is liked.`,
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route PUT articles/like/:id
 * @middleware authenticate, role(['verified'])
 *
 * Toggles the "like" status for a given article. If the article is liked by the user, it will be unliked; if it is not liked, it will be liked. Updates the article's like count accordingly.
 *
 * @description Validates the article ID as a UUID, verifies that the article exists, and toggles the like status for the current user. Responds with a success message indicating the updated like status.
 *
 * @param {string} id - The UUID of the article to be liked or unliked.
 * @header {Authorization} - Bearer token for user authentication.
 *
 * @throws {UserError} 404 - If the article ID is invalid or the article does not exist.
 * @throws {InternalError} 500 - If there is an error interacting with the database or updating the like count.
 *
 * @response {200} - Successfully toggled the like status. Message indicates whether the article was liked or unliked.
 */
router.put(
  '/like/:id',
  authenticate(),
  role(['verified']),
  asyncHandler(async (req: Request, res: Response) => {
    // Check if the id is a uuid
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.params.id
      );
    if (!isUuid) {
      throw new UserError('Article not found.', 404);
    }

    // Check if the article exists
    const article = await ArticleCrud.getMetadata(
      req.params.id,
      ArticleCrud.PUBLISHED_TABLE_NAME
    );
    if (article == null) {
      throw new UserError('Article not found.', 404);
    }

    // Create or delete the like object and adjust article rating
    const likeObject = await Likes.get(req.params.id, req.user!.username);
    if (likeObject == null) {
      await Likes.create(req.params.id, req.user!.username);
      await ArticleService.modifyLikeCount(req.params.id, 1);
    } else {
      await Likes.delete(req.params.id, req.user!.username);
      await ArticleService.modifyLikeCount(req.params.id, -1);
    }

    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: `Article sucessfully ${likeObject ? 'unliked' : 'liked'}.`,
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
