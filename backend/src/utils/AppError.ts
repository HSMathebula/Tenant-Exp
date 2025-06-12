export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'AppError';
  }
} 