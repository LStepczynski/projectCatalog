export interface User {
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
}

export interface UserInput {
  username: string;
  password: string;
  email: string;
  accountCreated?: number;
  profilePicture?: string;

  lastPictureChange?: number;
  lastEmailChange?: number;
  lastPasswordChange?: number;
  lastPasswordReset?: number;

  roles?: string[];
}
