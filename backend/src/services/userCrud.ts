import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  DeleteItemCommand,
  ReturnValue,
  QueryCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';
import { getUnixTimestamp } from '@utils/getUnixTimestamp';
import { UserInput, User } from '@type/user';
import { client } from '@database/dynamodb';
import { InternalError } from '@utils/statusError';

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
}
