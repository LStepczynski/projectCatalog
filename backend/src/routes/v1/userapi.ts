import { Router } from 'express';

import { UserManagment } from '../../services/userManagment';
import { Articles } from ':api/services/articles';
import { RateLimiting } from ':api/services/rateLimiting';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/sign-up', RateLimiting.register, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if ([username, password, email].some((val) => val === undefined)) {
    return res.status(400).send({
      status: 400,
      response: { message: 'username, password, or email is missing' },
    });
  }

  const response = await UserManagment.createUser(username, password, email);
  return res.status(response.status).send(response);
});

router.post('/sign-in', RateLimiting.login, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if ([username, password].some((val) => val === undefined)) {
    return res.status(400).send({
      status: 400,
      response: { message: 'username or password is missing' },
    });
  }
  const response = await UserManagment.verifyUser(username, password);

  // Send the token as a cookie and return the user object
  res.cookie('refresh', response.response.refreshToken, {
    httpOnly: true,
    secure: process.env.STATE === 'PRODUCTION',
    maxAge: 3*24*60*60*1000
  })
  delete response.response.refreshToken
  res.cookie('token', response.response.accessToken, {
    httpOnly: true,
    secure: process.env.STATE === 'PRODUCTION',
    maxAge: 30*60*1000
  })
  delete response.response.accessToken

  return res.status(response.status).send(response);
});

router.post(
  '/image',
  RateLimiting.profileChange,
  UserManagment.authenticateToken,
  upload.single('image'),
  async (req: any, res: any) => {
    const Username = req.query.username;
    
    if (!Username) {
      return res.status(400).send({
        status: 400,
        response: { message: 'missing username attribute' },
      });
    }
    
    if (!UserManagment.checkUsername(Username, req.user)) {
      return res.status(400).send({
        status: 404,
        response: { message: 'permission denied' },
      });
    }
    
    if (!req.file) {
      return res.status(400).send({
        status: 400,
        response: { message: 'missing image' },
      });
    }
    
    const response = await UserManagment.changeProfilePic(Username, req.file)
    
    // Send the token as a cookie and return the user object
    res.cookie('token', response.response.accessToken, {
      httpOnly: true,
      secure: process.env.STATE === 'PRODUCTION',
      maxAge: 30*60*1000
    })
    delete response.response.accessToken

    return res.status(response.status).send(response);
  }
);

router.get('/token-refresh', RateLimiting.tokenRefresh, async (req: any, res: any) => {
  // Grab the refresh token and check if it exists
  const refreshToken = req.cookies.refresh
  
  if (!refreshToken) {
    return res.status(401).send({status: 401, response: { message: 'missing refresh token cookie' }})
  }
  
  // Verify if the refresh token is valid
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_KEY || 'default',
    (err: any, user: any) => {
      // Check for errors
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

      // Create a new access token from the refresh token
      delete user.exp
      delete user.iat
      const token = UserManagment.getAccessJWT(user)

      // Return the cookie and the new user object
      res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.STATE === 'PRODUCTION',
        maxAge: 30*60*1000
      })
      
      return res.status(200).send({
        status: 200,
        response: { user: UserManagment.decodeJWT(token) },
      });
    }
  );
})

router.post(
  '/like',
  RateLimiting.like,
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const articleId = req.body.articleId;
    const user = req.user;
    
    if (!articleId) {
      return res
      .status(400)
      .send({ status: 400, response: { message: 'articleId not provided' } });
    }

    const fullUserObject = (await UserManagment.getUser(user.Username)) || {};
    try {
      // Checks if fullUserObject.Liked includes the article id 
      if (fullUserObject.Liked.includes(articleId)) {
        // Remove the id and decrement rating
        fullUserObject.Liked = fullUserObject.Liked.filter(
          (id: string) => id !== articleId
        );
        await Articles.decrementRating(articleId);
      } else {
        // Add id and increment like count
        fullUserObject.Liked.push(articleId);
        await Articles.incrementRating(articleId);
      }
    } catch (err) {
      console.log(err);
      return res
      .status(500)
      .send({ status: 500, response: { message: 'server error' } });
    }
    
    const response = await UserManagment.updateUser(
      user.Username,
      'Liked',
      fullUserObject.Liked
    );
    return res.status(response.status).send(response);
  }
);

router.get(
  '/isLiked',
  RateLimiting.generalAPI,
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const articleId = req.query.articleId;
    const user = req.user;
    
    if (!articleId) {
      return res
      .status(400)
      .send({ status: 400, response: { message: 'articleId not provided' } });
    }
    
    const isLiked = await UserManagment.isLikedByUser(user.Username, articleId);
    return res.status(200).send({ status: 200, response: { result: isLiked } });
  }
);

router.post('/change-password', RateLimiting.passwordReset, UserManagment.authenticateToken, async (req: any, res: any) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.user.Username

  if ([username, oldPassword, newPassword].some((val) => val === undefined)) {
    return res.status(400).send({
      status: 400,
      response: { message: 'Username, old password, or new password is missing.' },
    });
  }

  const response = await UserManagment.changePassword(username, oldPassword, newPassword);
  return res.status(response.status).send(response);
});

router.post('/password-reset', RateLimiting.passwordReset, UserManagment.authenticateToken, async (req: any, res: any) => {
  const user = req.user

  const result = await UserManagment.sendPasswordResetEmail(user.Username)

  if (result.response.accessToken) {
    res.cookie('token', result.response.accessToken, {
      httpOnly: true,
      secure: process.env.STATE === 'PRODUCTION',
      maxAge: 30*60*1000
    })
  }
  
  delete result.response.accessToken

  return res.status(result.status).send(result)
})

router.post('/forgot-password', RateLimiting.forgotPassword, async (req: any, res: any) => {
  const username = req.body.username;

  // Call the sendPasswordResetEmail method
  const result = await UserManagment.sendPasswordResetEmail(username);

  // Initialize the response object
  let response = {
    status: 0,
    response: { message: '' }
  };

  // Handle different status codes using switch
  switch (result.status) {
    case 200:
    case 403:
    case 404:
    case 429:
      response.status = 200;
      response.response.message = 'if the user is verified, a password reset email will be sent.';
      break;

    default:
      // Handle unexpected errors
      response.status = 500;
      response.response.message = 'server error. Please try again later.';
      break;
  }

  // Send the response with the appropriate status code
  return res.status(response.status).send(response);
});

router.post('/password-reset/:code', RateLimiting.passwordReset, async (req: any, res: any) => {
  const code = req.params.code

  const result = await UserManagment.resetPassword(code)
  return res.status(result.status).send(result)
})

router.post('/email-verification/:code', RateLimiting.emailVerification, async (req: any, res: any) => {
  const code = req.params.code
  
  const result = await UserManagment.verifyEmail(code)
  return res.status(result.status).send(result)
})

export default router;
