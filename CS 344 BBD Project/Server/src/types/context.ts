import { Request, Response } from 'express';

export interface MyContext {
  req: Request;
  res: Response;
  payload?: {
    userId: number;
    email: string;
    role: string;
  };
}
