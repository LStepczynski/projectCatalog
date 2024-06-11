import { Router } from 'express';

import { UserManagment } from '../../services/userManagment';

import dotenv from 'dotenv';
dotenv.config();

const router = Router();

router.post('/sign-up', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  console.log([username, password, email]);
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

  console.log([username, password]);
  if ([username, password].some((val) => val === undefined)) {
    return res.status(400).send({
      status: 400,
      response: { message: 'username or password is missing' },
    });
  }
  const response = await UserManagment.verifyUser(username, password);

  return res.status(response.status).send(response);
});

router.get('/test', UserManagment.authenticateToken, (req: any, res: any) => {
  return res.send(req.user);
});

export default router;
