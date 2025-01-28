export interface UserObject {
  username: string;
  password: string;
  email: string;
  accountCreated: number;
  profilePicture: string;

  lastPictureChange: number;
  lastEmailChange: number;
  lastPasswordChange: number;
  lastPasswordReset: number;

  roles: string[];

  exp: string;
}
