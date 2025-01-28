import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  QueryCommand,
  PutItemCommandInput,
  GetItemCommandInput,
  DeleteItemCommandInput,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { UserInput, User } from '@type/user';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export class UserCrud {
  private static TABLE_NAME = 'Users';
  private static DEFAULT_PROFILE_NAME = 'pfp';
  private static DEFAULT_PROFILE_URL = `https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/${this.DEFAULT_PROFILE_NAME}.webp`;
  // private static DEFAULT_PROFILE_URL = `http://localhost:9000/project-catalog-storage/images/${this.DEFAULT_PROFILE_NAME}.webp`;

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
   * Updates a user record in the database by `id` with the specified `updates`.
   * Automatically updates the `lastPictureChange` property if the `profilePicture` is updated.
   * Dynamically constructs the update expressions for efficient database updates.
   *
   * @param {string} id - The user username.
   * @param {Record<string, any>} updates - An object containing the fields to update and their new values.
   * @throws {InternalError} - If the database update operation fails.
   * @returns {Promise<User | null>} - The updated user object, or `null` if no updates were applied.
   */
  public static async update(
    id: string,
    updates: Record<string, any>
  ): Promise<User | null> {
    // Check if `updates` is empty
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return null;

    // Update the lastPictureChange property
    if (updateKeys.includes('profilePicture')) {
      updateKeys.push('lastPictureChange');
      updates.lastPictureChange = getUnixTimestamp();
    }

    // Prepare the UpdateCommand
    let updateExpression = 'SET';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build UpdateExpression and ExpressionAttributeValues dynamically
    updateKeys.forEach((key, index) => {
      const attributePlaceholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      // Append to UpdateExpression
      updateExpression += ` ${attributePlaceholder} = ${valuePlaceholder},`;

      // Add to ExpressionAttributeNames
      expressionAttributeNames[attributePlaceholder] = key;

      // Use marshall to convert the value dynamically
      const marshalledValue = marshall({ value: updates[key] }); // Wrap in object
      expressionAttributeValues[valuePlaceholder] = marshalledValue.value; // Extract formatted value
    });

    const params: UpdateItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: { username: { S: id } }, // Use marshall for the Key
      UpdateExpression: updateExpression.slice(0, -1), // Remove trailing comma
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    // Send request
    try {
      const response = await client.send(new UpdateItemCommand(params));
      return unmarshall(response.Attributes!) as User;
    } catch (error) {
      throw new InternalError(
        'Failed to update the item in the database.',
        500,
        ['updateUser']
      );
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

  /**
   * Deletes a user record from the database by username.
   * Returns the deleted user data if the deletion was successful.
   *
   * @param {string} username - The unique identifier of the user to delete.
   * @throws {InternalError} - If an error occurs during the deletion operation.
   * @returns {Promise<User | null>} - The deleted user object, or `null` if the user did not exist.
   */
  public static async delete(username: string): Promise<User | null> {
    const params: DeleteItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        username: { S: username },
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      const response = await client.send(new DeleteItemCommand(params));
      if (response.Attributes) {
        return unmarshall(response.Attributes) as User;
      }
      return null;
    } catch (err) {
      throw new InternalError('Error while deleting from the databse', 500, [
        'userDelete',
      ]);
    }
  }
}
