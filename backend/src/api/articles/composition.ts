import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';
import { asyncHandler } from '@utils/asyncHandler';
import { authenticate, role } from '@utils/middleware';
import { validCreateMetadata } from './utils/validCreateMetadata';
import { UserError } from '@utils/statusError';
import { ArticleCrud } from '@services/articleCrud';
import { v4 as uuid } from 'uuid';
import { SuccessResponse } from '@type/successResponse';
import { PrivateArticle } from '@type/article';

dotenv.config();

const router = Router();

/**
 * @route POST /create
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

export default router;
