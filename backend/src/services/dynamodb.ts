import { DynamoDB } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

export const client = new DynamoDB({
  region: 'us-east-2',
  ...(process.env.STATE === 'DEV' && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  }),
});
