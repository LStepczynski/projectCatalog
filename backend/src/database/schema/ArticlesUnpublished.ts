import {
  CreateTableCommandInput,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';

const articlesUnpublishedSchema: CreateTableCommandInput = {
  TableName: 'ArticlesUnpublished',
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

export default articlesUnpublishedSchema;
