import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
} from '@aws-sdk/client-dynamodb';

const tokensSchema: CreateTableCommandInput = {
  TableName: 'Tokens',
  AttributeDefinitions: [
    {
      AttributeName: 'content',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'username',
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'content',
      KeyType: 'HASH',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'UsernameIndex',
      KeySchema: [
        {
          AttributeName: 'username',
          KeyType: 'HASH',
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export default tokensSchema;
