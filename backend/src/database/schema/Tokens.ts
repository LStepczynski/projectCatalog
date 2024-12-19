import {
  CreateTableCommandInput,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';

const tokensSchema: CreateTableCommandInput = {
  TableName: 'Tokens',
  AttributeDefinitions: [
    {
      AttributeName: 'content',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'expiration',
      AttributeType: ScalarAttributeType.N,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'content',
      KeyType: 'HASH',
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export default tokensSchema;
