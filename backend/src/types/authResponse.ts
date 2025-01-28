import { ApiResponse } from '@type/apiResponse';

import { User } from '@type/user';

export interface AuthResponse<T> extends ApiResponse<T> {
  status: 'success';
  auth: {
    user: Omit<User, 'password'> & { exp: number };
  };
}
