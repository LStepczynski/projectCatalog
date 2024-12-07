import { ApiResponse } from '@type/apiResponse';

export interface SuccessResponse<T> extends ApiResponse<T> {
  status: 'success';
}
