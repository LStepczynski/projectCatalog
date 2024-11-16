export interface UserObject {
  Username: string;
  Password: string;
  Email: string;
  Admin: string;
  CanPost: string;
  Verified: string;
  LastPasswordChange: number;
  LastEmailChange: number;
  Liked: string[];
  ProfilePic: string;
  ProfilePicChange: any;
  AccountCreated: number;
  exp: string;
}
