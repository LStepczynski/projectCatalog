import { Router } from 'express';
import { Request, Response } from 'express';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { client } from ':api/services/dynamodb';

import { Articles } from ':api/services/articles';
import { S3 } from ':api/services/s3';

import dotenv from 'dotenv';

import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { Helper } from ':api/services/helper';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { UserManagment } from ':api/services/userManagment';

dotenv.config();

const router = Router();

// All private
router.get(
  '/private',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status || 'review';
    const user = req.user;

    if (!UserManagment.checkAdmin(user)) {
      return res
        .status(403)
        .send({ status: 403, message: 'permission denied' });
    }

    // Validate sortBy parameter
    let scanIndexForward = false;
    if (sortBy === 'lowest') {
      scanIndexForward = true;
    } else if (sortBy != 'highest') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid sortBy value' } });
    }

    // Fetch the result and return it
    const result = await Articles.getStatusCreated(
      status,
      page,
      limit,
      scanIndexForward
    );
    return res.status(result.status).send(result);
  }
);

// Delete
router.delete(
  '/delete',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const articleId = req.query.id;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Validate the articleId parameter
    if (articleId == undefined) {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'missing article id' } });
    }

    if (typeof articleId != 'string') {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid or article id data type' },
      });
    }

    // Get article Metadata
    const articleRequest = await Articles.getArticleMetadata(
      articleId,
      tableName
    );
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to delete
    if (!UserManagment.checkUsername(article.Author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.removeArticle(tableName, articleId);
    return res.status(result.status).send(result);
  }
);

// Publish
router.post(
  '/publish',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const ID = req.query.id;
    const user = req.user;

    // Validate the ID parameter
    if (ID == undefined) {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'missing article id' } });
    }

    if (!UserManagment.checkAdmin(user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.publishArticle(ID);
    return res.status(result.status).send(result);
  }
);

// Hide
router.post(
  '/hide',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const ID = req.query.id;
    const user = req.user;

    // Validate the ID parameter
    if (ID == undefined) {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'missing article id' } });
    }

    const articleRequest = await Articles.getArticleMetadata(
      ID,
      'ArticlesPublished'
    );
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to delete
    if (!UserManagment.checkUsername(article.Author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.hideArticle(ID);
    return res.status(result.status).send(result);
  }
);

// By id
router.get(
  '/get',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const articleId = req.query.id;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.getArticle(articleId, tableName);
    if (
      visibility == 'private' &&
      !UserManagment.checkUsername(result.response.return.metadata.Author, user)
    ) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }
    return res.status(result.status).send(result);
  }
);

// By author
router.get(
  '/author',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const author = req.query.authorName;
    const searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    if (visibility == 'private' && !UserManagment.checkUsername(author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Choose a correct fetch function and the sorting method
    let getFunc = Articles.getAuthorRating.bind(Articles); // Function
    let scanIndexForward: boolean = false; // Sort

    // Validate searchBy parameter
    if (searchBy === 'date') {
      getFunc = Articles.getAuthorCreated.bind(Articles);
    } else if (searchBy != 'rating') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid searchBy value' } });
    }

    // Validate sortBy parameter
    if (sortBy === 'lowest') {
      scanIndexForward = true;
    } else if (sortBy != 'highest') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid sortBy value' } });
    }

    const args: [string, string, number, number, boolean] = [
      tableName,
      author,
      page,
      limit,
      scanIndexForward,
    ];

    // Fetch the result and return it
    const result = await getFunc(...args);
    return res.status(result.status).send(result);
  }
);

// By title
router.get(
  '/title',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const title = req.query.title;
    const searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    if (visibility == 'private' && !UserManagment.checkAdmin(user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Choose a correct fetch function and the sorting method
    let getFunc = Articles.getTitleRating.bind(Articles); // Function
    let scanIndexForward: boolean = false; // Sort

    // Validate searchBy parameter
    if (searchBy === 'date') {
      getFunc = Articles.getTitleCreated.bind(Articles);
    } else if (searchBy != 'rating') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid searchBy value' } });
    }

    // Validate searchBy parameter
    if (sortBy === 'lowest') {
      scanIndexForward = true;
    } else if (sortBy != 'highest') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid sortBy value' } });
    }

    const args: [string, string, number, number, boolean] = [
      tableName,
      title,
      page,
      limit,
      scanIndexForward,
    ];

    // Fetch the result and return it
    const result = await getFunc(...args);
    return res.status(result.status).send(result);
  }
);

// By category
router.get(
  '/:categoryName',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const category = req.params.categoryName;
    const searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    if (visibility == 'private' && !UserManagment.checkAdmin(user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Choose a correct fetch function and the sorting method
    let getFunc = Articles.getCategoryRating.bind(Articles); // Function
    let scanIndexForward: boolean = false; // Sort

    // Validate searchBy parameter
    if (searchBy === 'date') {
      getFunc = Articles.getCategoryCreated.bind(Articles);
    } else if (searchBy != 'rating') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid searchBy value' } });
    }

    // Validate sortBy parameter
    if (sortBy === 'lowest') {
      scanIndexForward = true;
    } else if (sortBy != 'highest') {
      return res
        .status(400)
        .send({ status: 400, response: { message: 'Invalid sortBy value' } });
    }

    const args: [string, string, number, number, boolean] = [
      tableName,
      category,
      page,
      limit,
      scanIndexForward,
    ];

    // Fetch the result and return it
    const result = await getFunc(...args);
    return res.status(result.status).send(result);
  }
);

// By category/difficulty
router.get(
  '/:category/:difficulty',
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const category = req.params.category;
    const difficulty = req.params.difficulty;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    if (visibility == 'private' && !UserManagment.checkAdmin(user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.getCategoryDifficulty(
      tableName,
      category,
      difficulty,
      page,
      limit
    );
    return res.status(result.status).send(result);
  }
);

// Post
router.post(
  '/',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const body = req.body.body;
    const metadata = req.body.metadata;
    const ID = req.query.id || '';
    const user = req.user;

    // Check for the body and metadata parameters
    if (body == undefined || metadata == undefined) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid request - missing body or metadata' },
      });
    }

    // if (metadata.Image != undefined) {
    //   return res.status(400).send({
    //     status: 400,
    //     response: { message: 'invalid metadata format' },
    //   });
    // }

    if (!UserManagment.checkCanPost(user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.createArticle(
      'ArticlesUnpublished',
      metadata,
      body,
      ID
    );

    return res.status(result.status).send(result);
  }
);

// Edit
router.put('/', UserManagment.authenticateToken, async (req: any, res: any) => {
  const body = req.body.body;
  const metadata = req.body.metadata;
  const visibility = req.query.visibility || 'public';
  const user = req.user;

  // Validate the visibility parameter and choose a corresponding table
  let tableName = Helper.visibilityToTable(visibility);
  if (tableName == false) {
    return res.status(400).send({
      status: 400,
      response: { message: 'invalid visibility parameter' },
    });
  }

  // Check for the body and metadata parameters
  if (body == undefined || metadata == undefined) {
    res.status(400).send({
      status: 400,
      response: { message: 'invalid request - missing body or metadata' },
    });
    return;
  }

  const articleRequest = await Articles.getArticleMetadata(
    metadata.ID,
    tableName
  );
  const article = articleRequest.response.return;
  if (!article) {
    return res.status(articleRequest.status).send(articleRequest);
  }

  // Check if the user has permission to delete
  if (!UserManagment.checkUsername(article.Author, user)) {
    return res.status(403).send({
      status: 403,
      response: { message: 'permission denied' },
    });
  }

  // Fetch the result and return it
  const result = await Articles.updateArticle(tableName, metadata, body);
  return res.status(result.status).send(result);
});

router.patch(
  '/',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const key = req.body.key;
    const value = req.body.value;
    const ID = req.query.id;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    // Check for the body and metadata parameters
    if (key == undefined || value == undefined || ID == undefined) {
      res.status(400).send({
        status: 400,
        response: { message: 'invalid request - missing id, key or value' },
      });
      return;
    }

    const articleRequest = await Articles.getArticleMetadata(ID, tableName);
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to delete
    if (!UserManagment.checkUsername(article.Author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    // Fetch the result and return it
    const result = await Articles.patchArticle(tableName, ID, key, value);
    return res.status(result.status).send(result);
  }
);

// Image
router.post(
  '/image',
  UserManagment.authenticateToken,
  upload.single('image'),
  async (req: any, res: any) => {
    const ID = req.query.id;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Validate the visibility parameter and choose a corresponding table
    let tableName = Helper.visibilityToTable(visibility);
    if (tableName == false) {
      return res.status(400).send({
        status: 400,
        response: { message: 'invalid visibility parameter' },
      });
    }

    if (!req.file) {
      return res.status(400).send({
        status: 400,
        response: { message: 'missing image' },
      });
    }

    let articleRequest = await Articles.getArticle(ID, tableName);

    if (articleRequest.status != 200) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    const article = articleRequest.response.return;
    // Check if the user has permission to delete
    if (!UserManagment.checkUsername(article.metadata.Author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'permission denied' },
      });
    }

    const imageId = uuidv4();
    if (article.metadata.Image) {
      try {
        const regex =
          /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
        const match = article.metadata.Image.match(regex);
        const imageId = match ? match[0] : null;

        await S3.removeImageFromS3(imageId);
      } catch (err) {
        console.log(err);
      }
    }

    article.metadata.Image = `${process.env.AWS_S3_LINK}/images/${imageId}.png`;

    try {
      const response = await S3.saveImage(imageId, req.file);
      if (!response) {
        throw new Error('S3 error');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        status: 500,
        response: { message: 'server error' },
      });
    }

    const result = await Articles.updateArticle(
      tableName,
      article.metadata,
      article.body
    );
    return res.status(result.status).send(result);
  }
);

export default router;
