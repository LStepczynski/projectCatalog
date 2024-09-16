import { Router } from 'express';

import { UserManagment } from '../../services/userManagment';
import { Articles } from ':api/services/articles';
import { Helper } from ':api/services/helper';

import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/sign-up', async (req, res) => {
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

router.post('/sign-in', async (req, res) => {
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

router.post(
  '/like',
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

export default router;
