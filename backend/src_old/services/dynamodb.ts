import { DynamoDB } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

export const client = new DynamoDB({
  region: process.env.STATE === 'PRODUCTION' ? 'us-east-2' : 'local',
});
