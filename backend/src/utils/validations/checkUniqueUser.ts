import { UserCrud } from '@services/userCrud';
import { UserError } from '@utils/statusError';

/**
 * Checks the uniqueness of a username and email in the database.
 *
 * Fetches the username and email from the database to ensure they are not already in use.
 * Uses a batch approach to minimize the number of database requests.
 *
 * @param username - The username to check for uniqueness.
 * @param email - The email to check for uniqueness.
 * @throws UserError - If the username or email is already in use.
 */
export const checkUniqueUser = async (username: string, email: string) => {
  const [existingUsername, existingEmail] = await Promise.all([
    UserCrud.get(username),
    UserCrud.query({
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    }),
  ]);

  if (existingUsername) {
    throw new UserError('Username is already in use', 409);
  }

  if (existingEmail.length > 0) {
    throw new UserError('Email is already in use', 409);
  }
};
