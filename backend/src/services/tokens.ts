// Import necessary AWS SDK clients and commands
import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand, // Import DeleteItemCommand
  AttributeValue,
} from '@aws-sdk/client-dynamodb';
import { client } from './dynamodb'; // Import the DynamoDB client from a separate module

// Define the Token interface
interface Token {
  username: string;
  value: string;
  type: string;
  expiration: number;
  newEmail?: string; // Optional parameter
}

// Define the static Tokens class
export class Tokens {
  // Static properties
  static client = client;
  static tableName = 'Tokens';

  private static capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Validates the token object to ensure it matches the Token interface.
   * @param token The token object to validate.
   * @throws Error if validation fails.
   */
  static validateToken(token: any): asserts token is Token {
    const requiredFields: { [key: string]: string } = {
      username: 'string',
      value: 'string',
      type: 'string',
      expiration: 'number',
    };

    const optionalFields: { [key: string]: string } = {
      newEmail: 'string',
    };

    // Check for invalid fields
    const tokenKeys = Object.keys(token);
    const allowedKeys = [
      ...Object.keys(requiredFields),
      ...Object.keys(optionalFields),
    ];
    for (const key of tokenKeys) {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Invalid field '${key}' in token object.`);
      }
    }

    // Check for missing required fields and type correctness
    for (const key of Object.keys(requiredFields)) {
      if (!(key in token)) {
        throw new Error(`Missing required field '${key}' in token object.`);
      }
      if (typeof token[key] !== requiredFields[key]) {
        throw new Error(
          `Field '${key}' should be of type '${requiredFields[key]}'.`
        );
      }
    }

    // Check optional fields type correctness if they exist
    for (const key of Object.keys(optionalFields)) {
      if (key in token && typeof token[key] !== optionalFields[key]) {
        throw new Error(
          `Field '${key}' should be of type '${optionalFields[key]}'.`
        );
      }
    }
  }

  /**
   * Creates a new token in DynamoDB after validating the input.
   * @param token The token object to create.
   */
  static async createToken(token: Token): Promise<void> {
    // Validate the token object
    this.validateToken(token);

    // Prepare the DynamoDB PutItemCommand
    const item: { [key: string]: AttributeValue } = {
      Value: { S: token.value },
      Username: { S: token.username },
      Type: { S: token.type },
      Expiration: { N: token.expiration.toString() },
    };

    // Include newEmail if it exists
    if (token.newEmail) {
      item.NewEmail = { S: token.newEmail };
    }

    const params = {
      TableName: this.tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(#value)', // Use placeholder for reserved keyword
      ExpressionAttributeNames: {
        '#value': 'Value', // Map the placeholder to the actual attribute name
      },
    };

    try {
      const command = new PutItemCommand(params);
      await this.client.send(command);
      console.log('Token created successfully.');
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Token with this value already exists.');
      }
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }

  /**
   * Retrieves a token from DynamoDB by its value.
   * @param value The unique value of the token.
   * @returns The Token object if found, otherwise null.
   */
  static async getToken(value: string): Promise<Token | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        Value: { S: value },
      },
    };

    try {
      const command = new GetItemCommand(params);
      const response = await this.client.send(command);

      if (!response.Item) {
        return null;
      }

      const token: Token = {
        value: response.Item.Value.S!,
        username: response.Item.Username.S!,
        type: response.Item.Type.S!,
        expiration: parseInt(response.Item.Expiration.N!),
      };

      // Include newEmail if it exists
      if (response.Item.NewEmail && response.Item.NewEmail.S) {
        token.newEmail = response.Item.NewEmail.S;
      }

      return token;
    } catch (error: any) {
      throw new Error(`Failed to retrieve token: ${error.message}`);
    }
  }

  /**
   * Updates an existing token's attributes in DynamoDB.
   * @param value The unique value of the token to update.
   * @param updates An object containing the fields to update.
   */
  static async updateToken(
    value: string,
    updates: Partial<Omit<Token, 'value'>>
  ): Promise<void> {
    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided.');
    }

    // Define allowed fields for updates, including optional newEmail
    const allowedFields: (keyof Omit<Token, 'value'>)[] = [
      'username',
      'type',
      'expiration',
      'newEmail',
    ];

    // Build the update expression
    let updateExpression = 'SET ';
    const ExpressionAttributeNames: { [key: string]: string } = {};
    const ExpressionAttributeValues: { [key: string]: AttributeValue } = {};

    allowedFields.forEach((field, index) => {
      if (field in updates) {
        const attributeName = `#field${index}`;
        const attributeValue = `:value${index}`;
        updateExpression += `${attributeName} = ${attributeValue}, `;
        ExpressionAttributeNames[attributeName] =
          this.capitalizeFirstLetter(field);
        const fieldValue = updates[field];
        if (field === 'expiration' && typeof fieldValue === 'number') {
          ExpressionAttributeValues[attributeValue] = {
            N: fieldValue.toString(),
          };
        } else if (field === 'newEmail' && typeof fieldValue === 'string') {
          ExpressionAttributeValues[attributeValue] = { S: fieldValue };
        } else if (typeof fieldValue === 'string') {
          ExpressionAttributeValues[attributeValue] = { S: fieldValue };
        } else {
          throw new Error(`Invalid type for field '${field}'.`);
        }
      }
    });

    // Remove the trailing comma and space
    updateExpression = updateExpression.slice(0, -2);

    const params = {
      TableName: this.tableName,
      Key: {
        Value: { S: value },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        '#value': 'Value', // Map placeholder for 'Value'
        ...ExpressionAttributeNames,
      },
      ExpressionAttributeValues,
      ConditionExpression: 'attribute_exists(Value)', // Ensure the token exists
    };

    try {
      const command = new UpdateItemCommand(params);
      await this.client.send(command);
      console.log('Token updated successfully.');
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Token does not exist.');
      }
      throw new Error(`Failed to update token: ${error.message}`);
    }
  }

  /**
   * Deletes a token from DynamoDB by its value.
   * @param value The unique value of the token to delete.
   */
  static async deleteToken(value: string): Promise<void> {
    // Prepare the DynamoDB DeleteItemCommand
    const params = {
      TableName: this.tableName,
      Key: {
        Value: { S: value },
      },
      ConditionExpression: 'attribute_exists(#value)', // Use placeholder for reserved keyword
      ExpressionAttributeNames: {
        '#value': 'Value', // Map the placeholder to the actual field name 'Value'
      },
    };

    try {
      const command = new DeleteItemCommand(params);
      await this.client.send(command);
      console.log('Token deleted successfully.');
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Token does not exist.');
      }
      throw new Error(`Failed to delete token: ${error.message}`);
    }
  }
}
