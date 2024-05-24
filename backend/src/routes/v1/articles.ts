import { Router } from 'express';
import { client } from ':api/services/dynamodb';
import { Request, Response } from 'express';
import { Articles } from ':api/services/articles';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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
  const articleId = req.body.id;

  if (articleId == undefined) {
    return res.status(400).send({ message: 'missing article id' });
  }

  if (typeof articleId != 'string') {
    return res.status(400).send({ message: 'invalid or article id data type' });
  }

  const result = await Articles.removeArticle('ArticlesUnpublished', articleId);
  return res.status(result.status).send(result);
});

// By id
router.get('/get', async (req: any, res: any) => {
  const articleId = req.query.id;

  const result = await Articles.getArticle(articleId, 'ArticlesUnpublished');
  return res.status(result.status).send(result);
});

// By author
router.get('/author', async (req: any, res: any) => {
  const author = req.query.authorName;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);

  const result = await Articles.getAuthorRating(
    'ArticlesUnpublished',
    author,
    page,
    limit
  );
  return res.status(result.status).send(result);
});

// By title
router.get('/title', async (req: any, res: any) => {
  const title = req.query.title;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);

  const result = await Articles.getTitleRating(
    'ArticlesUnpublished',
    title,
    page,
    limit
  );
  return res.status(result.status).send(result);
});

// By category
router.get('/:categoryName', async (req: Request, res: Response) => {
  const category = req.params.categoryName;
  const searchBy = req.query.searchBy || 'rating';
  const sortBy = req.query.sortBy || 'highest';
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  let getFunc = Articles.getCategoryRating.bind(Articles);
  let scanIndexForward: boolean = false;

  if (searchBy === 'date') {
    getFunc = Articles.getCategoryCreated.bind(Articles);
  } else if (searchBy != 'rating') {
    return res
      .status(400)
      .send({ status: 400, message: 'Invalid searchBy value' });
  }

  if (sortBy === 'lowest') {
    scanIndexForward = true;
  } else if (sortBy != 'highest') {
    return res
      .status(400)
      .send({ status: 400, message: 'Invalid sortBy value' });
  }

  const args: [string, string, number, number, boolean] = [
    'ArticlesUnpublished',
    category,
    page,
    limit,
    scanIndexForward,
  ];

  const result = await getFunc(...args);
  return res.status(result.status).send(result);
});

// By category/difficulty
router.get('/:category/:difficulty', async (req: any, res: any) => {
  const category = req.params.category;
  const difficulty = req.params.difficulty;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);

  const result = await Articles.getCategoryDifficulty(
    'ArticlesUnpublished',
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

  if (body == undefined || metadata == undefined) {
    res
      .status(400)
      .send({ error: 'invalid request - missing body or metadata' });
    return;
  }

  const { status, response } = await Articles.createArticle(
    'ArticlesUnpublished',
    metadata,
    body
  );
  return res.status(status).send(response);
});

export default router;
