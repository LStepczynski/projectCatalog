import { Router } from 'express';

import { UserManagment } from '../../services/userManagment';

import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { Helper } from ':api/services/helper';
import { v4 as uuidv4 } from 'uuid';
import { S3 } from ':api/services/s3';

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

    let user = await UserManagment.getUser(Username);

    if (!user) {
      return res
        .status(404)
        .send({ status: 404, response: { message: 'user not found' } });
    }

    const oldImageId = user.ProfilePic.match(
      /images\/([a-f0-9-]+)\.(?:png|jpg|jpeg|gif)$/
    );
    if (oldImageId) {
      S3.removeImageFromS3(oldImageId[1]);
    }

    const imageId = uuidv4();

    user.ProfilePic = `${process.env.AWS_S3_LINK}/images/${imageId}.png`;

    try {
      const response = await S3.saveImage(imageId, req.file, 350, 350);
      if (!response) {
        throw new Error('S3 error');
      }
    } catch (err) {
      console.log('Error: ', err);
      return res.status(500).send({
        status: 500,
        response: { message: 'server error' },
      });
    }

    const result = await UserManagment.updateUser(
      Username,
      'ProfilePic',
      user.ProfilePic
    );

    const resultWithToken: any = result;
    delete user.Password;
    resultWithToken.response.verificationToken = UserManagment.getNewJWT(user);
    return res.status(resultWithToken.status).send(resultWithToken);
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
    if (fullUserObject.Liked.includes(articleId)) {
      fullUserObject.Liked = fullUserObject.Liked.filter(
        (id: string) => id !== articleId
      );
    } else {
      fullUserObject.Liked.push(articleId);
    }

    const response = await UserManagment.updateUser(
      user.Username,
      'Liked',
      fullUserObject.Liked
    );
    return res.status(response.status).send(response);
  }
);

export default router;
