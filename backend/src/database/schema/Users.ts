import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
} from '@aws-sdk/client-dynamodb';

const usersSchema: CreateTableCommandInput = {
  TableName: 'Users',
  AttributeDefinitions: [
    {
      AttributeName: 'username',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'email',
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'username',
      KeyType: 'HASH',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        {
          AttributeName: 'email',
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

export default usersSchema;
