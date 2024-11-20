import { ApiResponse } from '@type/apiResponse';

export interface ErrorResponse extends ApiResponse<null> {
  status: 'error';
  details?: string[];
  stack?: string;
}
