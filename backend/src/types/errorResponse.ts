import { ApiResponse } from '@type/apiResponse';

export interface ErrorResponse extends ApiResponse<null> {
  status: 'error';
  errorCode: string;
  details?: string[];
}
