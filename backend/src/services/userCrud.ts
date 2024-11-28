import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  DeleteItemCommand,
  ReturnValue,
  QueryCommand,
  PutItemCommandInput,
  GetItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { UserInput, User } from '@type/user';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export class UserCrud {
  private static TABLE_NAME = 'Users';
  private static DEFAULT_PROFILE_URL =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/pfp.png';

  /**
   * Creates a User object and adds it to the database
   * TODO: hash the password
   * @public
   * @static
   * @param {UserInput} partialUserObject
   * @returns {Promise<User>}
   */
  public static async create(partialUserObject: UserInput): Promise<User> {
    const currentTime = getUnixTimestamp();

    // Fill in missing fields with defaults
    const finishedUserObject: User = {
      profilePicture: this.DEFAULT_PROFILE_URL,
      accountCreated: currentTime,
      lastPictureChange: 0,
      lastEmailChange: 0,
      lastPasswordChange: 0,
      lastPasswordReset: 0,
      roles: [],
      ...partialUserObject,
    };

    // Request params
    const params: PutItemCommandInput = {
      TableName: this.TABLE_NAME,
      Item: marshall(finishedUserObject),
    };

    try {
      await client.send(new PutItemCommand(params));
      return finishedUserObject;
    } catch (err) {
      throw new InternalError('Addition to the database failed', 500, [
        'createUser',
      ]);
    }
  }

  /**
   * Queries the DynamoDB table for multiple users based on the provided query parameters.
   *
   * @param params - The query parameters to execute the DynamoDB query.
   *                 These include `TableName`, `KeyConditionExpression`, and other optional query conditions.
   * @returns A promise that resolves to an array of `User` objects matching the query conditions.
   *          Returns an empty array if no users are found.
   * @throws InternalError - If an unexpected issue occurs during the query execution.
   */
  public static async query(
    params: Omit<QueryCommandInput, 'TableName'>
  ): Promise<User[]> {
    // Add the table name to the params
    const completeParams: QueryCommandInput = {
      TableName: this.TABLE_NAME,
      ...params,
    };

    try {
      const resp = await client.send(new QueryCommand(completeParams));

      // Return the user objects
      if (resp.Items && resp.Items.length > 0) {
        return resp.Items.map((item) => unmarshall(item) as User);
      }

      // Return an empty array if no users found
      return [];
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        'Error while fetching the users from the database',
        500,
        ['queryUsers']
      );
    }
  }

  /**
   * Retrieves a single user from the DynamoDB table based on the provided username.
   *
   * @param username - The username of the user to retrieve from the table.
   * @returns A promise that resolves to the `User` object if found, or `null` if the user does not exist.
   * @throws InternalError - If an unexpected issue occurs during the retrieval process.
   */
  public static async get(username: string): Promise<User | null> {
    // Request params
    const params: GetItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        username: { S: username },
      },
    };

    try {
      // Send request
      const resp = await client.send(new GetItemCommand(params));

      // Return the item if found
      if (resp.Item) {
        return unmarshall(resp.Item) as User;
      }

      return null;
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        'Error while fetching the user from the database',
        500,
        ['getUser']
      );
    }
  }
}
