import { tables } from '@database/schema';
import {
  CreateTableCommand,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';

import { client } from '@database/dynamodb';

import {} from '@aws-sdk/client-dynamodb';

const enableTTL = async () => {};

enableTTL().catch(console.error);

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

  try {
    const ttlCommand = new UpdateTimeToLiveCommand({
      TableName: 'Tokens',
      TimeToLiveSpecification: {
        AttributeName: 'expiration',
        Enabled: true,
      },
    });
    await client.send(ttlCommand);
    console.log('TTL enabled on Tokens table');
  } catch (err) {
    console.error(`[❌] - Error while adding TTL to Tokens.`);
    console.error(err);
  }
};

(async () => {
  createTables();
})();
