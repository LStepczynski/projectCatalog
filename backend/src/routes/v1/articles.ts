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

dotenv.config();

const router = Router();

router.get('/', async (req: any, res: any) => {
  try {
    const data = await client.send(
      new ScanCommand({ TableName: 'ArticlesUnpublished' })
    );
    // Extract the 'Items' property from the data object
    const items = data.Items || [];
    // Map each item to its unmarshalled form
    const unmarshalledItems = items.map((item) => unmarshall(item));
    res.status(200).send(unmarshalledItems);
  } catch (error) {
    console.error('Error scanning table:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete
router.delete('/delete', async (req: any, res: any) => {
  const articleId = req.query.id;
  const visibility = req.query.visibility || 'public';

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

  // Fetch the result and return it
  const result = await Articles.removeArticle(tableName, articleId);
  return res.status(result.status).send(result);
});

// Publish
router.post('/publish', async (req: any, res: any) => {
  const ID = req.query.id;

  // Validate the ID parameter
  if (ID == undefined) {
    return res
      .status(400)
      .send({ status: 400, response: { message: 'missing article id' } });
  }

  // Fetch the result and return it
  const result = await Articles.publishArticle(ID);
  return res.status(result.status).send(result);
});

// By id
router.get('/get', async (req: any, res: any) => {
  const articleId = req.query.id;
  const visibility = req.query.visibility || 'public';

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
  return res.status(result.status).send(result);
});

// By author
router.get('/author', async (req: any, res: any) => {
  const author = req.query.authorName;
  const searchBy = req.query.searchBy || 'rating';
  const sortBy = req.query.sortBy || 'highest';
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const visibility = req.query.visibility || 'public';

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
});

// By title
router.get('/title', async (req: any, res: any) => {
  const title = req.query.title;
  const searchBy = req.query.searchBy || 'rating';
  const sortBy = req.query.sortBy || 'highest';
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const visibility = req.query.visibility || 'public';

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
});

// By category
router.get('/:categoryName', async (req: any, res: any) => {
  const category = req.params.categoryName;
  const searchBy = req.query.searchBy || 'rating';
  const sortBy = req.query.sortBy || 'highest';
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const visibility = req.query.visibility || 'public';

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
});

// By category/difficulty
router.get('/:category/:difficulty', async (req: any, res: any) => {
  const category = req.params.category;
  const difficulty = req.params.difficulty;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const visibility = req.query.visibility || 'public';

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
});

router.post('/', async (req: any, res: any) => {
  const body = req.body.body;
  const metadata = req.body.metadata;

  // Check for the body and metadata parameters
  if (body == undefined || metadata == undefined) {
    return res.status(400).send({
      status: 400,
      response: { message: 'invalid request - missing body or metadata' },
    });
  }

  if (metadata.Image != undefined) {
    return res.status(400).send({
      status: 400,
      response: { message: 'invalid metadata format' },
    });
  }

  // Fetch the result and return it
  const result = await Articles.createArticle(
    'ArticlesUnpublished',
    metadata,
    body
  );

  return res.status(result.status).send(result);
});

router.put('/', async (req: any, res: any) => {
  const body = req.body.body;
  const metadata = req.body.metadata;
  const visibility = req.query.visibility || 'public';

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

  // Fetch the result and return it
  const result = await Articles.updateArticle(tableName, metadata, body);
  return res.status(result.status).send(result);
});

router.post('/image', upload.single('image'), async (req: any, res: any) => {
  const ID = req.query.id;
  const visibility = req.query.visibility || 'public';

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

  let article = await Articles.getArticle(ID, tableName);

  if (article.status != 200) {
    return res.status(article.status).send(article);
  }

  article = article.response.return;

  const imageId = uuidv4();

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
});

export default router;
