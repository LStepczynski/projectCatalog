// Import necessary AWS SDK clients and commands
import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand, // Import DeleteItemCommand
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { client } from './dynamodb'; // Import the DynamoDB client from a separate module

// Define the Token interface
interface Token {
  username: string;
  value: string;
  type: string;
  expiration: number;
}

// Define the static Tokens class
export class Tokens {
  // Static properties
  static client = client;
  static tableName = "Tokens";

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
      username: "string",
      value: "string",
      type: "string",
      expiration: "number",
    };

    // Check for extra fields
    const tokenKeys = Object.keys(token);
    const requiredKeys = Object.keys(requiredFields);
    for (const key of tokenKeys) {
      if (!requiredKeys.includes(key)) {
        throw new Error(`Invalid field '${key}' in token object.`);
      }
    }

    // Check for missing fields and type correctness
    for (const key of requiredKeys) {
      if (!(key in token)) {
        throw new Error(`Missing required field '${key}' in token object.`);
      }
      if (typeof token[key] !== requiredFields[key]) {
        throw new Error(
          `Field '${key}' should be of type '${requiredFields[key]}'.`
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
    const params = {
      TableName: this.tableName,
      Item: {
        Value: { S: token.value },   // Use the actual attribute name directly in the Item object
        Username: { S: token.username },
        Type: { S: token.type },
        Expiration: { N: token.expiration.toString() },
      },
      ConditionExpression: "attribute_not_exists(#value)", // Use #value as a placeholder for the reserved keyword 'Value'
      ExpressionAttributeNames: {
        "#value": "Value" // Map the placeholder to the actual field name 'Value'
      },
    };
  
    try {
      const command = new PutItemCommand(params);
      await this.client.send(command);
      console.log("Token created successfully.");
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Token with this value already exists.");
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
    updates: Partial<Omit<Token, "value">>
  ): Promise<void> {
    if (Object.keys(updates).length === 0) {
      throw new Error("No updates provided.");
    }
  
    // Define allowed fields for updates
    const allowedFields: (keyof Omit<Token, "value">)[] = ["username", "type", "expiration"];
  
    // Build the update expression
    let updateExpression = "SET ";
    const ExpressionAttributeNames: { [key: string]: string } = {};
    const ExpressionAttributeValues: { [key: string]: AttributeValue } = {};
  
    allowedFields.forEach((field, index) => {
      if (field in updates) {
        const attributeName = `#field${index}`;
        const attributeValue = `:value${index}`;
        updateExpression += `${attributeName} = ${attributeValue}, `;
        ExpressionAttributeNames[attributeName] = this.capitalizeFirstLetter(field);
        const fieldValue = updates[field];
        if (field === "expiration" && typeof fieldValue === "number") {
          ExpressionAttributeValues[attributeValue] = { N: fieldValue.toString() };
        } else if (typeof fieldValue === "string") {
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
        "#value": "Value",  // Map placeholder for 'Value'
        ...ExpressionAttributeNames,
      },
      ExpressionAttributeValues,
      ConditionExpression: "attribute_exists(#value)", // Use placeholder for 'Value'
    };
  
    try {
      const command = new UpdateItemCommand(params);
      await this.client.send(command);
      console.log("Token updated successfully.");
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Token does not exist.");
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
      ConditionExpression: "attribute_exists(#value)", // Ensure the token exists before deletion
      ExpressionAttributeNames: {
        "#value": "Value" // Map the placeholder to the actual field name 'Value'
      },
    };

    try {
      const command = new DeleteItemCommand(params);
      await this.client.send(command);
      console.log("Token deleted successfully.");
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Token does not exist.");
      }
      throw new Error(`Failed to delete token: ${error.message}`);
    }
  }
}