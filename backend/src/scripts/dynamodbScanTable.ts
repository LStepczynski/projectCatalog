import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

import { client } from '@database/dynamodb';

async function showTableContents(tableName: string) {
  try {
    const command = new ScanCommand({ TableName: tableName });
    const data = await client.send(command);
    const unmarshaledItems = data.Items?.map((item) => unmarshall(item));
    console.log('Items in table:', JSON.stringify(unmarshaledItems, null, 2));
  } catch (error) {
    console.error(`Error scanning table "${tableName}":`, error);
  }
}

const tableName = process.argv[2];
if (!tableName) {
  console.error(
    'Please specify a table name. Example: npm run scanTable -- YourTableName'
  );
  process.exit(1);
}

showTableContents(tableName);
