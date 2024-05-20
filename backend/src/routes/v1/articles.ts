import { Router } from 'express';
import { client } from ':api/services/dynamodb';
import { Articles } from ':api/services/articles';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const router = Router();

router.get('/', async (req: any, res: any) => {
  try {
    const data = await client.send(new ScanCommand({ TableName: 'Articles' }));
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
    return res.status(400).send('missing article id');
  }

  if (typeof articleId != 'string') {
    return res.status(400).send('invalid or article id data type');
  }

  const result = await Articles.removeArticle('ArticlesUnpublished', articleId);
  return res.status(result.status).send(result);
});

// By id
router.get('/get/:id', async (req: any, res: any) => {
  const articleId = req.params.id;

  if (typeof articleId != 'string') {
    return res.status(400).send('invalid article id data type');
  }

  const result = await Articles.getArticle(articleId, 'ArticlesUnpublished');
  return res.status(result.status).send(result);
});

// By author
router.get('/author/:authorName/:page/:limit', async (req: any, res: any) => {
  const author = req.params.authorName;
  const limit = Number(req.params.limit);
  const page = Number(req.params.page);

  const result = await Articles.getAuthorRating(
    'ArticlesUnpublished',
    author,
    page,
    limit
  );
  return res.status(result.status).send(result);
});

// By category
router.get('/:categoryName/:page/:limit', async (req: any, res: any) => {
  const category = req.params.categoryName;
  const limit = Number(req.params.limit);
  const page = Number(req.params.page);

  const result = await Articles.getCategoryCreated(
    'ArticlesUnpublished',
    category,
    page,
    limit
  );
  return res.status(result.status).send(result);
});

// By category/difficulty
router.get(
  '/:category/:difficulty/:page/:limit',
  async (req: any, res: any) => {
    const category = req.params.category;
    const difficulty = req.params.difficulty;
    const limit = Number(req.params.limit);
    const page = Number(req.params.page);

    if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return res
        .status(400)
        .send({ status: 400, message: 'invalid difficulty value' });
    }

    const result = await Articles.getCategoryDifficulty(
      'ArticlesUnpublished',
      category,
      difficulty,
      page,
      limit
    );
    return res.status(result.status).send(result);
  }
);

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
