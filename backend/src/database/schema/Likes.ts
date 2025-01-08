import {
  CreateTableCommandInput,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';

const tokensSchema: CreateTableCommandInput = {
  TableName: 'Likes',
  AttributeDefinitions: [
    {
      AttributeName: 'username',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'article',
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'username',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'article',
      KeyType: 'RANGE',
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export default tokensSchema;
