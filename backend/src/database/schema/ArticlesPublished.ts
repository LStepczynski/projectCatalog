import {
  CreateTableCommandInput,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';

const articlesPublishedSchema: CreateTableCommandInput = {
  TableName: 'ArticlesPublished',
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export default articlesPublishedSchema;
