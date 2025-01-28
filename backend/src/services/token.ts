import {
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  PutItemCommandInput,
  GetItemCommandInput,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { client } from '@database/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Token } from '@type/token';
import { FieldSchema, InternalError, validateSchema } from '@utils/index';

// Define the static Tokens class
export class Tokens {
  // Static properties
  static tableName = 'Tokens';

  /**
   * Validates the given token object against a predefined schema.
   * Ensures that the token conforms to the expected structure and types.
   * If the validation fails, an InternalError is thrown.
   *
   * @param token - The object to validate as a token.
   * @throws {InternalError} - Throws an error if the token does not match the required schema.
   *
   * @example
   * // Valid token
   * const validToken = {
   *   username: 'user123',
   *   content: 'tokenContent',
   *   type: 'access',
   *   expiration: 1672531199,
   * };
   * Tokens.validateToken(validToken); // Passes validation
   *
   * // Invalid token
   * const invalidToken = {
   *   username: 'user123',
   *   content: 'tokenContent',
   *   expiration: 'notANumber', // Invalid type
   * };
   * Tokens.validateToken(invalidToken); // Throws InternalError
   */
  static validateToken(token: unknown): asserts token is Token {
    const tokenSchema: Record<string, FieldSchema> = {
      username: {
        type: 'string',
        required: true,
      },
      content: {
        type: 'string',
        required: true,
      },
      type: {
        type: 'string',
        required: true,
      },
      expiration: {
        type: 'number',
        required: true,
      },
      data: {
        type: 'any',
        required: false,
      },
    };

    if (validateSchema(token, tokenSchema)) {
      return;
    }
    throw new InternalError('Invalid token schema', 500, [
      'Token',
      'validateToken',
    ]);
  }

  /**
   * Validates and stores a token in the DynamoDB table.
   * Ensures that the token meets the required schema and uses DynamoDB's `PutItemCommand` to save it.
   *
   * @param token - The Token object to be stored. Must include all required fields, such as `username`, `content`, `type`, and `expiration`.
   * @throws {InternalError} - Throws an error if the token is invalid or if there is an issue with saving it to DynamoDB.
   *
   * @example
   * const token: Token = {
   *   username: 'user123',
   *   content: 'tokenContent',
   *   type: 'access',
   *   expiration: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
   *   data: { scope: 'read-only' },
   * };
   *
   * await Tokens.createToken(token); // Stores the token in DynamoDB
   */
  static async createToken(token: Token): Promise<void> {
    // Validate the token object
    this.validateToken(token);

    // Prepare the DynamoDB PutItemCommand
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(token),
    };

    try {
      await client.send(new PutItemCommand(params));
    } catch (err) {
      throw new InternalError(`Failed to create token.`, 500, ['createToken']);
    }
  }

  /**
   * Retrieves a token from DynamoDB by its unique value.
   * Queries the DynamoDB table using the token's `content` as the key.
   *
   * @param value - The unique `content` value of the token to retrieve.
   * @returns A Promise resolving to the Token object if found, or `null` if no token matches the given value.
   * @throws {InternalError} - Throws an error if there is an issue retrieving the token from DynamoDB.
   *
   * @example
   * const token = await Tokens.getToken('tokenContent');
   * if (token) {
   *   console.log('Token retrieved:', token);
   * } else {
   *   console.log('Token not found.');
   * }
   */
  static async getToken(value: string): Promise<Token | null> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        content: { S: value },
      },
    };

    try {
      const response = await client.send(new GetItemCommand(params));

      if (!response.Item) {
        return null;
      }

      return unmarshall(response.Item) as Token;
    } catch (err) {
      throw new InternalError('Error fetching token.', 500, ['getToken']);
    }
  }

  /**
   * Deletes a token from the DynamoDB table by its unique value and returns the deleted object.
   * Uses DynamoDB's `DeleteItemCommand` to remove the token and retrieve its previous attributes.
   *
   * @param value - The unique `content` value of the token to delete.
   * @returns A Promise that resolves to the deleted Token object if found, or `null` if no token was found.
   * @throws {InternalError} - Throws an error if there is an issue deleting the token from DynamoDB.
   *
   * @example
   * try {
   *   const deletedToken = await MyClass.deleteToken('tokenContent');
   *   if (deletedToken) {
   *     console.log('Deleted token:', deletedToken);
   *   } else {
   *     console.log('Token not found.');
   *   }
   * } catch (error) {
   *   console.error('Failed to delete token:', error);
   * }
   */
  static async deleteToken(value: string): Promise<Token | null> {
    // Prepare the DynamoDB DeleteItemCommand
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        content: { S: value },
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      const response = await client.send(new DeleteItemCommand(params));

      if (!response.Attributes) {
        // No item was deleted (item not found)
        return null;
      }

      // Unmarshall the deleted attributes into a Token object
      return unmarshall(response.Attributes) as Token;
    } catch (error: any) {
      throw new InternalError('Error while deleting token.', 500, [
        'deleteToken',
      ]);
    }
  }
}
