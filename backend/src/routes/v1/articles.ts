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

router.get('/:id', async (req: any, res: any) => {
  const articleId = req.params.id;

  if (typeof articleId != 'string') {
    return res.status(400).send('invalid article id data type');
  }

  const result = await Articles.get(articleId, 'ArticlesUnpublished');
  if (result.response.return != undefined) {
    return res.status(result.status).send(result);
  }
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

  const { status, response } = await Articles.create(
    'ArticlesUnpublished',
    metadata,
    body
  );
  console.log(status, response);
  res.status(status).send(response);
});

export default router;