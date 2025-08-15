import { Response } from 'express';

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export default abstract class BaseController {
  protected success<T>(res: Response, data: T, statusCode: number = 200): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = { success: true, data };
    return res.status(statusCode).json(response);
  }

  protected error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: Record<string, string[]>
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
  }

  protected notFound(res: Response, message: string = 'Resource not found'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  protected handleError(res: Response, error: unknown): Response<ApiResponse> {
    console.error('Error:', error);
    
    if (error instanceof Error) {
      return this.error(res, error.message, 500);
    }
    
    return this.error(res, 'An unexpected error occurred', 500);
  }
}
