import { client } from '../services/dynamodb';
import {
  ListTablesCommand,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';

// Function to list all tables
const listTables = async () => {
  try {
    const data = await client.send(new ListTablesCommand({}));
    return data.TableNames;
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
};

// Function to delete all tables
const deleteAllTables = async () => {
  try {
    const tableNames = (await listTables()) || [];
    for (const tableName of tableNames) {
      await client.send(new DeleteTableCommand({ TableName: tableName }));
      console.log(`Table "${tableName}" deleted successfully.`);
    }
  } catch (error) {
    console.error('Error deleting tables:', error);
  }
};

// Call the function to delete all tables
deleteAllTables();
