export interface Token {
  username: string;
  content: string;
  type: string;
  expiration: number;
  data?: Record<string, any>;
}
