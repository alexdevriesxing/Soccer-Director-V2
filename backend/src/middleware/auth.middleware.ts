import { Request, Response, NextFunction } from 'express';

// Stub auth middleware - actual auth to be implemented
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        clubId?: number;
    };
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    // Stub: set default user for development
    (req as AuthenticatedRequest).user = {
        id: 1,
        role: 'manager',
        clubId: 1
    };
    next();
};

export const requireAuth = authenticate;
export default { authenticate, requireAuth };
