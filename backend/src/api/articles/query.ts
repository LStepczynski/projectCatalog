import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';

import { SuccessResponse } from '@type/successResponse';
import { PrivateArticle, PublicArticle } from '@type/article';

import { authenticate, role } from '@utils/middleware';
import { asyncHandler } from '@utils/asyncHandler';
import { UserError } from '@utils/statusError';

import { validGetBody } from '@api/articles/utils/validGetBody';

import { ArticleCrud } from '@services/articleCrud';

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

export default router;
