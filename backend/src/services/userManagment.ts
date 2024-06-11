import {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

import bcrypt from 'bcryptjs';
import { Helper } from './helper';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { client } from './dynamodb';

dotenv.config();

export class UserManagment {
  public static isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static async genPassHash(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  public static async compareHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  public static async createUser(
    username: string,
    password: string,
    email: string
  ) {
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
    password = await this.genPassHash(password);

    const userObject = {
      Username: username,
      Password: password,
      Email: email,
      ProfilePic:
        'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/pfp.png',
      AccountCreated: Helper.getUNIXTimestamp(),
    };

    const params: any = {
      TableName: 'Users',
      Item: marshall(userObject),
    };
    try {
      await client.send(new PutItemCommand(params));
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

  public static async verifyUser(username: string, password: string) {
    const user = await this.getUser(username);
    if (user == null) {
      return {
        status: 401,
        response: { message: 'invalid login credentials' },
      };
    }

    const verified = await this.compareHash(password, user.Password);
    if (!verified) {
      return {
        status: 401,
        response: { message: 'invalid login credentials' },
      };
    }

    delete user.Password;

    const token = jwt.sign(user, process.env.JWT_KEY || 'default');
    return {
      status: 200,
      response: { accessToken: token },
    };
  }

  public static authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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
