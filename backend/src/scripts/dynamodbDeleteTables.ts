import { client } from '@database/dynamodb';
import {
  ListTablesCommand,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';

// Function to list all tables
const listTables = async () => {
  try {
    const data = await client.send(new ListTablesCommand({}));
    return data.TableNames;
  } catch (err) {
    console.error('[❌] - Error listing tables');
    console.error(err);
    return [];
  }
};

// Function to delete all tables
const deleteAllTables = async () => {
  const tableNames = (await listTables()) || [];

  for (const tableName of tableNames) {
    try {
      await client.send(new DeleteTableCommand({ TableName: tableName }));
      console.log(`[✅] - Table ${tableName} was successfully deleted.`);
    } catch (error) {
      console.error(`[❌] - Error while deleting table: ${tableName}`, error);
    }
  }
};

// Call the function to delete all tables
deleteAllTables();
