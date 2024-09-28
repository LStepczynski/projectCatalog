import { Router } from 'express';
import { Articles } from ':api/services/articles';
import { S3 } from ':api/services/s3';
import { RateLimiting } from ':api/services/rateLimiting';

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
  RateLimiting.generalAPI,
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status || 'review';
    const user = req.user;

    // Check for permissions
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
  RateLimiting.articleEdit,
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
  RateLimiting.articleEdit,
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

    // Check for permissions
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
  RateLimiting.articleEdit,
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

    // Fetch the article
    const articleRequest = await Articles.getArticleMetadata(
      ID,
      'ArticlesPublished'
    );
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to hide the article
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
  RateLimiting.generalAPI,
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
    try {
      const metadataResult = await Articles.getArticleMetadata(
        articleId,
        tableName
      );
      const metadata = metadataResult.response.return;
      
      // If the article is private check for permissions
      if (
        visibility == 'private' &&
        !UserManagment.checkUsername(metadata.Author, user)
      ) {
        return res.status(403).send({
          status: 403,
          response: { message: 'permission denied' },
        });
      }
      // Get only the body of the article from the S3
      const bodyResult = await Articles.getArticle(articleId, tableName);
      bodyResult.response.return.metadata = metadata; // Assign the metadata from the database
      return res.status(bodyResult.status).send(bodyResult);
    } catch (err) {
      console.log(err);
      return res.status(500).send('server error');
    }
  }
);

// By author
router.get(
  '/author',
  RateLimiting.generalAPI,
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const author = req.query.authorName;
    let searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Check for permissions
    if (visibility == 'private') {
      if (!UserManagment.checkUsername(author, user)) {
        return res.status(403).send({
          status: 403,
          response: { message: 'permission denied' },
        });
      }
      searchBy = 'date'
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
  RateLimiting.generalAPI,
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const title = req.query.title;
    const searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Check for permissions
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
  RateLimiting.generalAPI,
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const category = req.params.categoryName;
    const searchBy = req.query.searchBy || 'rating';
    const sortBy = req.query.sortBy || 'highest';
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Check for permissions
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
  RateLimiting.generalAPI,
  UserManagment.authTokenOptional,
  async (req: any, res: any) => {
    const category = req.params.category;
    const difficulty = req.params.difficulty;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const visibility = req.query.visibility || 'public';
    const user = req.user;

    // Check for permissions
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
  RateLimiting.articleCreationChange,
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

    // Check for permissions
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
router.put(
  '/', 
  RateLimiting.articleCreationChange, 
  UserManagment.authenticateToken, 
  async (req: any, res: any) => {
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

    // Fetch the article metadata
    const articleRequest = await Articles.getArticleMetadata(
      metadata.ID,
      tableName
    );
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to edit
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
  RateLimiting.articleCreationChange,
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

    // Fetch article
    const articleRequest = await Articles.getArticleMetadata(ID, tableName);
    const article = articleRequest.response.return;
    if (!article) {
      return res.status(articleRequest.status).send(articleRequest);
    }

    // Check if the user has permission to patch
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
  RateLimiting.articleCreationChange,
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

    // Check for file
    if (!req.file) {
      return res.status(400).send({
        status: 400,
        response: { message: 'missing image' },
      });
    }

    // Fetch the article metadata from the database
    const metadataResp = await Articles.getArticleMetadata(ID, 'ArticlesUnpublished');
    if (metadataResp.status != 200) {
      return res.status(metadataResp.status).send(metadataResp);
    }

    // Check if the user has permission to add the image
    if (!UserManagment.checkUsername(metadataResp.response.return.Author, user)) {
      return res.status(403).send({
        status: 403,
        response: { message: 'invalid permisions' },
      });
    }

    // Fetch the whole article from the S3
    const bodyResp = await Articles.getArticle(ID, 'ArticlesUnpublished');
    if (bodyResp.status != 200) {
      return res.status(bodyResp.status).send(bodyResp);
    }
 
    // Combine the metadata from the database with the body from the S3 into a new object
    const article = {body: bodyResp.response.return.body, metadata: metadataResp.response.return};

    const imageId = uuidv4();

    // Remove the last image of an article
    if (article.metadata.Image) {
      try {
        // Extract the uuid from the image url
        const regex =
          /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
        const match = article.metadata.Image.match(regex);
        const imageId = match ? match[0] : null;

        await S3.removeImageFromS3(imageId);
      } catch (err) {
        console.log(err);
      }
    }

    // Generate new image url
    article.metadata.Image = `${process.env.AWS_S3_LINK}/images/${imageId}.png`;

    // Add the image to the S3
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
