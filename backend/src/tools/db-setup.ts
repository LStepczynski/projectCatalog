import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '../services/dynamodb';
import {
  PutItemCommand,
  CreateTableCommand,
  CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const IMPORT_DIR = './src/assets';

const createTables = async () => {
  try {
    const data = fs.readFileSync('./src/tools/schema.json', 'utf-8');

    const tables = JSON.parse(data);

    for (const table of tables) {
      try {
        await client.send(new CreateTableCommand(table));
        console.log(`Created table: ${table.TableName}`);
      } catch (err) {
        console.log(`Error creating table ${table.TableName}:`, err);
      }
    }
  } catch (err) {
    console.log('Error loading or parsing table schema:', err);
  }
};

const importItems = async () => {
  fs.readdir(IMPORT_DIR, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    const directories = files.filter((file) => {
      const filePath = path.join(IMPORT_DIR, file);
      return fs.statSync(filePath).isDirectory();
    });

    directories.forEach((directory) => {
      const filePath = path.join(IMPORT_DIR, directory);
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return;
        }
        const markdownFiles = files.filter(
          (file) => path.extname(file).toLowerCase() === '.md'
        );

        markdownFiles.forEach(async (file) => {
          const markdownContent = fs.readFileSync(
            path.join(IMPORT_DIR, directory, file),
            'utf8'
          );
          const { data, content } = matter(markdownContent);

          data.ID = String(data.ID);
          data.Rating = 0

          const params = {
            TableName: directory,
            Item: marshall(data),
          };

          // Put item into DynamoDB table
          try {
            await client.send(new PutItemCommand(params))
            console.log(`${directory}: Item added - `, data);
          } catch (err: any) {
            console.error('Error adding item to DynamoDB:', err);
          }
        });
      });
    });
  });
};

const main = async () => {
  await createTables();
  await importItems();
};

main();
