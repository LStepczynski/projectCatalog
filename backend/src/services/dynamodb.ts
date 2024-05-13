import { DynamoDB } from '@aws-sdk/client-dynamodb';

export const client = new DynamoDB({
  region: 'local',
  credentials: {
    accessKeyId: 'ABC',
    secretAccessKey: 'XYZ123',
  },
});
