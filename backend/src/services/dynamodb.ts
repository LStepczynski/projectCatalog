import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);
