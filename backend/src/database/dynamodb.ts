import { DynamoDB } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

console.log(
  `❗❗❗\n\nTABLE REGION: ${
    process.env.STATE === 'production' ? 'us-east-2' : 'local'
  }\n\n❗❗❗\n`
);

export const client = new DynamoDB({
  region: process.env.STATE === 'production' ? 'us-east-2' : 'local',
});
