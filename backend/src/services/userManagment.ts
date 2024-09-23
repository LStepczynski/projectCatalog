import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  DeleteItemCommand,
  ReturnValue,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

import bcrypt from 'bcryptjs';
import { Helper } from './helper';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { S3 } from './s3';
import { v4 as uuidv4 } from 'uuid';
import { Email } from './email';

import { client } from './dynamodb';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

dotenv.config();

interface UserObject {
  Username: string,
  Password: string,
  Email: string,
  Admin: string,
  Liked: string[],
  CanPost: string,
  ProfilePic: string;
  ProfilePicChange: any,
  AccountCreated: number,
  Verified: string,
  VerificationCode: string
}

export class UserManagment {
  public static profilePicCooldown = 7 * 24 * 60 * 60 // 1 week

  /**
   * Checks if an email is valid using regex
   *
   * @public
   * @static
   * @param {string} email
   * @returns {boolean}
   */
  public static isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static randomBytesHex(length: number) {
    const buffer = new Uint8Array(length);
  
    // Fill the buffer with random values
    for (let i = 0; i < length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  
    // Convert buffer to a hexadecimal string
    const hexString = Array.from(buffer)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  
    return hexString;
  } 

  /**
   * Checks if the username matches the one in the user object or if the user is an admin
   *
   * @public
   * @static
   * @param {string} username
   * @param {dict} user - user object
   * @returns {boolean}
   */
  public static checkUsername(username: string, user: any) {
    if (user.Admin === 'true') return true;
    if (user.Username === username) return true;
    return false;
  }

  /**
   * Checks if an user is an admin
   *
   * @public
   * @static
   * @param {UserObject} user - user object
   * @returns {boolean}
   */
  public static checkAdmin(user: any) {
    if (user.Admin === 'true') return true;
    return false;
  }

  /**
   * Checks if an user has the permision to post articles
   *
   * @public
   * @static
   * @param {UserObject} user - user object
   * @returns {boolean}
   */
  public static checkCanPost(user: any) {
    if (user.Admin === 'true') return true;
    if (user.CanPost === 'true') return true;
    return false;
  }

  /**
   * Decodes the object from a JWT
   *
   * @public
   * @static
   * @param {string} token - JWT
   * @returns {*} object
   */
  public static decodeJWT(token: string) {
    const base64Url = token.split('.')[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }

  /**
   * Creates a new access JWT from an user object
   *
   * @public
   * @static
   * @param {UserObject} user
   * @returns {string}
   */
  public static getAccessJWT(user: any) {
    return jwt.sign(user, process.env.JWT_KEY || 'default', { expiresIn: '30m'});
  }

  /**
   * Creates a new refresh JWT from an user object
   *
   * @public
   * @static
   * @param {UserObject} user
   * @returns {string}
   */
    public static getRefreshJWT(user: any) {
      return jwt.sign(user, process.env.JWT_REFRESH_KEY || 'default', { expiresIn: '3d'});
    }

  /**
   * Hashes a password and returns it
   *
   * @public
   * @static
   * @async
   * @param {string} password
   * @returns {string}
   */
  public static async genPassHash(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compares a password with a password hash
   *
   * @public
   * @static
   * @async
   * @param {string} password
   * @param {string} hash
   * @returns {boolean}
   */
  public static async compareHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Checks if the provided timestamp is older than the cooldown value
   *
   * @public
   * @static
   * @param {*} timestamp
   * @returns {boolean}
   */
  public static checkProfilePictureCooldown(timestamp: any) {
    const currentTime = Helper.getUNIXTimestamp()
    if (timestamp != 'null' && currentTime - timestamp < this.profilePicCooldown) {
      return false
    }
    return true
  }

  /**
   * Creates an user object, adds it to the database, and returns the api response
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @param {string} [canPost='false']
   * @param {string} [admin='false']
   * @returns {unknown}
   */
  public static async createUser(
    username: string,
    password: string,
    email: string,
    canPost: string = 'false',
    admin: string = 'false'
  ) {
    // Validate the parameters
    if (!this.isValidEmail(email)) {
      return {
        status: 400,
        response: { message: 'invalid email address' },
      };
    }

    if (password.length < 8) {
      return {
        status: 400,
        response: { message: 'password must be at least 8 characters long' },
      };
    }

    if ((await this.getUser(username)) != null) {
      return {
        status: 400,
        response: { message: 'username is already in use' },
      };
    }
    // Hash the password
    password = await this.genPassHash(password);
    const verificationCode = this.randomBytesHex(24)

    // Create the user object
    const userObject: UserObject = {
      Username: username,
      Password: password,
      Email: email,
      Admin: admin,
      Liked: [],
      CanPost: canPost,
      ProfilePic:
        'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/pfp.png',
      ProfilePicChange: 'null',
      AccountCreated: Helper.getUNIXTimestamp(),
      Verified: 'false',
      VerificationCode: verificationCode,
    };

    // Add the object to the database and return a response
    const params: any = {
      TableName: 'Users',
      Item: marshall(userObject),
    };
    try {
      await client.send(new PutItemCommand(params));

      Email.sendAccountVerificationEmail(email, verificationCode)

      return {
        status: 200,
        response: { message: 'user created successfuly' },
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        response: { message: 'server error' },
      };
    }
  }

  /**
   * Deletes a user from the database and returns a response
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @returns {unknown}
   */
  public static async deleteUser(username: string) {
    const params = {
      TableName: 'Users',
      Key: {
        Username: { S: username },
      },
      ReturnValues: ReturnValue.ALL_OLD,
    };

    try {
      const response = await client.send(new DeleteItemCommand(params));

      if (!response.Attributes) {
        return { status: 404, response: { message: 'account not found' } };
      }
      return {
        status: 200,
        response: { message: 'account deleted succesfuly' },
      };
    } catch (err) {
      console.log(err);
      return { status: 500, response: { message: 'server error' } };
    }
  }

  /**
   * Fetches a user object from the database and returns it. Otherwise returns null
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @returns {unknown}
   */
  public static async getUser(username: string) {
    const params: any = {
      TableName: 'Users',
      Key: {
        Username: { S: username },
      },
    };

    try {
      const result = await client.send(new GetItemCommand(params));
      if (result.Item) {
        return unmarshall(result.Item);
      }
      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Checks if an article is in the user's liked list
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @param {string} articleId
   * @returns {unknown}
   */
  public static async isLikedByUser(username: string, articleId: string) {
    const user = await this.getUser(username);
    if (!user) {
      return false;
    }
    if (user.Liked.includes(articleId)) {
      return true;
    }
    return false;
  }

  /**
   * Updates the user object in the database and returns an api response
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @param {string} fieldName
   * @param {*} fieldValue
   * @returns {unknown}
   */
  public static async updateUser(
    username: string,
    fieldName: string,
    fieldValue: any 
  ) {
    const allowedFields = [
      'Email',
      'Password',
      'ProfilePic',
      'ProfilePicChange',
      'CanPost',
      'Admin',
      'Liked',
      'Verified'
    ];

    // Check for dissallowed fields
    if (!allowedFields.includes(fieldName)) {
      return {
        status: 400,
        response: { message: 'Disallowed field' },
      };
    }

    // Dynamically determine the DynamoDB attribute type
    let dynamoValue;
    if (typeof fieldValue === 'string') {
      dynamoValue = { S: fieldValue };
    } else if (typeof fieldValue === 'number') {
      dynamoValue = { N: fieldValue.toString() };
    } else if (typeof fieldValue === 'boolean') {
      dynamoValue = { BOOL: fieldValue };
    } else if (Array.isArray(fieldValue)) {
      dynamoValue = { L: fieldValue.map((item) => ({ S: item.toString() })) };
    } else if (fieldValue === null) {
      dynamoValue = { NULL: true };
    } else {
      return {
        status: 400,
        response: { message: 'Unsupported data type' },
      };
    }

    const params: UpdateItemCommandInput = {
      TableName: 'Users',
      Key: {
        Username: { S: username },
      },
      UpdateExpression: 'SET #field = :newVal',
      ExpressionAttributeNames: {
        '#field': fieldName,
      },
      ExpressionAttributeValues: {
        ':newVal': dynamoValue,
      },
      ReturnValues: 'ALL_OLD',
    };

    // Update the user and return a response
    try {
      const command = new UpdateItemCommand(params);
      const result = await client.send(command);

      if (!result.Attributes) {
        return {
          status: 404,
          response: { message: 'User not found' },
        };
      }

      return {
        status: 200,
        response: { message: 'Item updated successfully' },
      };
    } catch (err) {
      console.error('Error updating item:', err);
      return {
        status: 500,
        response: { message: 'Internal server error' },
      };
    }
  }

  /**
   * Authenticates the user with the username and password. Returns the user JWT object 
   * and the api response
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @param {string} password
   * @returns {unknown}
   */
  public static async verifyUser(username: string, password: string) {
    const user = await this.getUser(username);
    if (user == null) {
      return {
        status: 401,
        response: { message: 'invalid login credentials' },
      };
    }

    // Check for valid login credentials
    const verified = await this.compareHash(password, user.Password);
    if (!verified) {
      return {
        status: 401,
        response: { message: 'invalid login credentials' },
      };
    }

    // Delete the sensitive information from the user object before
    // turning it into a JWT
    delete user.Password;
    delete user.Liked
    delete user.VerificationCode

    // Create the JWT and return it
    const token = this.getAccessJWT(user);
    const refresh = this.getRefreshJWT(user)
    return {
      status: 200,
      response: { accessToken: token, refreshToken: refresh, user: this.decodeJWT(token) },
    };
  }

  /**
   * Changes the user's profile picture
   *
   * @public
   * @static
   * @async
   * @param {string} username
   * @param {file} file - profile picture image
   * @returns {unknown} - api response
   */
  public static async changeProfilePic(username: string, file: any) {

    // Fetch the user 
    let user = await UserManagment.getUser(username);
    if (!user) {
      return { status: 404, response: { message: 'user not found' } }
    }

    // Check if the cooldown for changing the profile picture has passed
    const timestamp = Helper.getUNIXTimestamp()
    if (!this.checkProfilePictureCooldown(user.ProfilePicChange)) {
      return {status: 403, response: { message: 'the user profile picture was changed in the last week'}}
    }

    // Edit the ProfilePicChange property of the user object
    const userEditRes = await this.updateUser(user.Username, 'ProfilePicChange', timestamp)
    if (userEditRes.status != 200) {
      return userEditRes
    }
    user.ProfilePicChange = timestamp

    // Get the old user profile picture and delete it
    const oldImageId = user.ProfilePic.match(
      /images\/([a-f0-9-]+)\.(?:png|jpg|jpeg|gif)$/
    );
    if (oldImageId) {
      S3.removeImageFromS3(oldImageId[1]);
    }

    // Create the url for the new picture
    const imageId = uuidv4();
    user.ProfilePic = `${process.env.AWS_S3_LINK}/images/${imageId}.png`;

    // Save the picture in the S3 in 350x350 format
    try {
      const response = await S3.saveImage(imageId, file, 350, 350);
      if (!response) {
        throw new Error('S3 error');
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        status: 500,
        response: { message: 'server error' },
      };
    }

    // Update the profile picture link on all of the user's articles
    if (user.Admin || user.CanPost) {
      // A function to get all of the user's articles from a table
      const queryArticles = async (tableName: string) => {
        const articleReq = await client.send(new QueryCommand({
          TableName: tableName,
          IndexName: 'AuthorDifficulty',
          KeyConditionExpression: 'Author = :username',
          ExpressionAttributeValues: {
            ':username': { S: user.Username }
          },
          ProjectionExpression: 'ID'
        }));
        return articleReq.Items || [];
      };
    
      // A function to update all the user articles from a table
      const updateArticles = async (tableName: string, articles: any) => {
        return Promise.all(articles.map(async (item: any) => {
          const id = item.ID?.S;
          if (id) {
            await client.send(new UpdateItemCommand({
              TableName: tableName,
              Key: { ID: { S: id } },
              UpdateExpression: 'SET AuthorProfilePic = :newLink',
              ExpressionAttributeValues: {
                ':newLink': { S: user.ProfilePic }
              }
            }));
          }
        }));
      };
    
      // Get user's articles
      const [privateArticles, publicArticles] = await Promise.all([
        queryArticles('ArticlesUnpublished'),
        queryArticles('ArticlesPublished')
      ]);
    
      // Update user's articles
      await Promise.all([
        updateArticles('ArticlesUnpublished', privateArticles),
        updateArticles('ArticlesPublished', publicArticles)
      ]);
    }
    
    // Update the user's profile picture link
    const result = await UserManagment.updateUser(
      username,
      'ProfilePic',
      user.ProfilePic
    );

    // Modify the response from the updateUser function by adding in the new JWT
    // Token and return it
    const resultWithToken: any = result;
    delete user.Password;
    delete user.Liked;
    delete user.VerificationCode

    resultWithToken.response.verificationToken = UserManagment.getAccessJWT(user);
    resultWithToken.response.user = user
    return resultWithToken
  }

  public static async verifyEmail(verificationCode: string) {
    const params = {
      TableName: 'Users',
      IndexName: 'VerificationCodeIndex', // Use the index name for querying
      KeyConditionExpression: 'VerificationCode = :code',
      ExpressionAttributeValues: {
        ':code': { S: verificationCode },
      },
    };
  
    try {
      const result = await client.send(new QueryCommand(params));
      if (result.Items && result.Items.length > 0) {
        const user = unmarshall(result.Items[0]); 
        console.log(user);
        if (user.Verified === 'false') {
          const updateRes = await this.updateUser(user.Username, 'Verified', 'true')

          if (updateRes.status == 200) {
            return { status: 200, response: { message: 'email verified' } };
          } else {
            throw new Error("unable to edit user verification property")
          }
        } else {
          return { status: 410, response: { message: 'account already verified' } };
        }
      }
      return { status: 404, response: { message: 'user not found' } };
    } catch (err) {
      console.log(err);
      return { status: 500, response: { message: 'server error' } };
    }
  }

  public static authenticateToken(req: any, res: any, next: any) {
    const token = req.cookies.token
    if (token == null) {
      return res.status(400).send({
        status: 400,
        response: { message: 'missing authentication token' },
      });
    }
    
    jwt.verify(
      token,
      process.env.JWT_KEY || 'default',
      (err: any, user: any) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).send({
              status: 401,
              response: { message: 'token expired' },
            });
          }
          return res.status(403).send({
            status: 403,
            response: { message: 'invalid token' },
          });
        }

        if (user.Verified == 'false') {
          return res.status(403).send({
            status: 403,
            response: { message: 'account not verified' },
          });
        }

        req.user = user;
        next();
      }
    );
  }

  public static authTokenOptional(req: any, res: any, next: any) {
    const token = req.cookies.token
    if (token == null) {
      req.user = {};
      next();
      return;
    }

    jwt.verify(
      token,
      process.env.JWT_KEY || 'default',
      (err: any, user: any) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).send({
              status: 401,
              response: { message: 'token expired' },
            });
          }
          return res.status(403).send({
            status: 403,
            response: { message: 'invalid token' },
          });
        }
        req.user = user;
        next();
      }
    );
  }
}
