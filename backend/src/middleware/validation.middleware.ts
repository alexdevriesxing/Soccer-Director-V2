import { Request, Response, NextFunction, RequestHandler } from 'express';

// Stub validation middleware
export const validate = (_schema: any): RequestHandler => {
    return (_req: Request, _res: Response, next: NextFunction) => {
        next();
    };
};

export default { validate };
