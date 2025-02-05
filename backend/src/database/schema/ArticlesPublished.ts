import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
} from '@aws-sdk/client-dynamodb';

const articlesPublishedSchema: CreateTableCommandInput = {
  TableName: 'ArticlesPublished',
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'author',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'difficulty',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'publishedAt',
      AttributeType: ScalarAttributeType.N,
    },
    {
      AttributeName: 'category',
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: 'likes',
      AttributeType: ScalarAttributeType.N,
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'AuthorDifficultyIndex',
      KeySchema: [
        {
          AttributeName: 'author',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'difficulty',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: 'CategoryPublishedAtIndex',
      KeySchema: [
        {
          AttributeName: 'category',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'publishedAt',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: 'CategoryLikesIndex',
      KeySchema: [
        {
          AttributeName: 'category',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'likes',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: 'AuthorPublishedAtIndex',
      KeySchema: [
        {
          AttributeName: 'author',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'publishedAt',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export default articlesPublishedSchema;
