import { Router } from 'express';

import { UserManagment } from '../../services/userManagment';

import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { Helper } from ':api/services/helper';
import { v4 as uuidv4 } from 'uuid';
import { S3 } from ':api/services/s3';
import { Articles } from ':api/services/articles';

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
      if (fullUserObject.Liked.includes(articleId)) {
        fullUserObject.Liked = fullUserObject.Liked.filter(
          (id: string) => id !== articleId
        );
        await Articles.decrementRating(articleId);
      } else {
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

router.post(
  '/isLiked',
  UserManagment.authenticateToken,
  async (req: any, res: any) => {
    const articleId = req.body.articleId;
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
