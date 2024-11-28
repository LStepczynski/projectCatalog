import { tables } from '@database/schema';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

import { client } from '@database/dynamodb';

const createTables = async () => {
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`[✅] - Table ${table.TableName} was succesfully created.`);
    } catch (err) {
      console.error(`[❌] - Error while creating ${table.TableName}.`);
      console.error(err);
    }
  }
};

(async () => {
  createTables();
})();
