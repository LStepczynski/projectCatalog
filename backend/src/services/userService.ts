import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { User } from '@type/user';
import { client } from '@database/dynamodb';
import { InternalError, UserError } from '@utils/statusError';
import { S3 } from '@services/s3';
import { UserCrud } from './userCrud';

import { v4 as uuid } from 'uuid';
import { ArticleService } from './articleService';
import { ArticleCrud } from './articleCrud';

export class UserService {
  private static TABLE_NAME = 'Users';
  private static DEFAULT_PROFILE_NAME = 'pfp';

  /**
   * Deletes a user's account along with all their associated articles.
   * Fetches the user if a username string is provided, and deletes both unpublished and published articles.
   * Finally, removes the user record from the database.
   *
   * @param {User | string} user - The user object or the username string of the user.
   * @throws {UserError} - If the user does not exist.
   * @returns {Promise<User | null>} - The deleted user object, or `null` if the user did not exist.
   */
  public static async deleteUserAccount(user: User | string) {
    // If `user` is a string, fetch the user from the database and save it as `user`
    if (typeof user === 'string') {
      const result = await UserCrud.get(user);
      if (result) {
        user = result;
      } else {
        throw new UserError('User not found', 404);
      }
    }

    // Fetch all user article ids
    const privateArticleIds = await ArticleService.getUserArticles(
      user.username,
      ArticleCrud.UNPUBLISHED_TABLE_NAME
    );
    const publicArticleIds = await ArticleService.getUserArticles(
      user.username,
      ArticleCrud.PUBLISHED_TABLE_NAME
    );

    // Send delete requests if any articles are found
    if (privateArticleIds.length > 0) {
      await ArticleCrud.batchDelete(
        privateArticleIds,
        ArticleCrud.UNPUBLISHED_TABLE_NAME
      );
    }

    if (publicArticleIds.length > 0) {
      await ArticleCrud.batchDelete(
        publicArticleIds,
        ArticleCrud.PUBLISHED_TABLE_NAME
      );
    }

    // Delete the user from the database
    return await UserCrud.delete(user.username);
  }

  /**
   * Appends a role to the user's roles list in the DynamoDB table.
   *
   * @param userId - The ID of the user.
   * @param role - The role to append to the roles list.
   * @throws {Error} - If the update operation fails.
   */
  public static async appendRoleToUser(
    userId: string,
    role: string
  ): Promise<User> {
    const params: UpdateItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        username: { S: userId },
      },
      UpdateExpression:
        'SET #roles = list_append(if_not_exists(#roles, :emptyList), :newRole)',
      ExpressionAttributeNames: {
        '#roles': 'roles',
      },
      ExpressionAttributeValues: {
        ':newRole': { L: [{ S: role }] }, // List containing the new role
        ':emptyList': { L: [] }, // Empty list to initialize roles if it doesn't exist
      },
      ConditionExpression: 'attribute_exists(username)',
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await client.send(new UpdateItemCommand(params));
      return unmarshall(result.Attributes as any) as User;
    } catch (err) {
      throw new InternalError('Failed to append role to user.', 500, [
        'appendRoleToUser',
      ]);
    }
  }

  /**
   *
   * Changes the user's profile picture, replacing it with the new image.
   * If the user is a string, fetches the user data from the database.
   * Handles image management, including overwriting default or existing profile pictures.
   * Updates related articles' profile pictures if the user has a publisher role.
   *
   * @param {User | string} user - The user object or the username string of the user.
   * @param {string} image - The new profile picture in base64 format.
   * @throws {UserError} - If the user is not found.
   * @throws {InternalError} - If the profile picture URL is invalid.
   * @returns {Promise<User>} - The updated user object.
   */
  public static async changeProfile(
    user: User | string,
    image: string
  ): Promise<User> {
    // If `user` is a string, fetch the user from the database and save it as `user`
    if (typeof user === 'string') {
      const result = await UserCrud.get(user);
      if (result) {
        user = result;
      } else {
        throw new UserError('User not found', 404);
      }
    }

    // Check for the name of the image file
    const oldImageId = user.profilePicture?.includes('/images/')
      ? user.profilePicture.split('/images/')[1]?.split(/\.webp|\.png/)[0]
      : null;

    // Check if the image name was found
    if (!oldImageId) {
      throw new InternalError('Invalid profile picture URL', 500, [
        'changeProfile',
      ]);
    }

    // Check if the current image id is the default
    const defaultImage = oldImageId == this.DEFAULT_PROFILE_NAME;

    // If the current image is the default, set the new ID to a uuid
    let newImageId = uuid();
    if (!defaultImage) {
      // Overwrite the current image with the same name to save an S3 delete API call.
      newImageId = oldImageId;
    }

    // Save the new image
    const url = await S3.saveImage(newImageId, image, 350, 350);

    // Update the link in the database if it changed
    if (defaultImage) {
      if (user.roles.includes('publisher')) {
        await ArticleService.updateArticlesByAuthor(user.username, {
          authorProfilePicture: url,
        });
      }

      const updatedUser = await UserCrud.update(user.username, {
        profilePicture: url,
      });
      if (updatedUser) {
        return updatedUser;
      }
    }
    return user;
  }
}
