import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const STATUS = 401;
    const UNAUTHORIZED = 'Unauthorized';
    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, ENV.JWT_SECRET);
            req.authContext = { 
                strategy: 'JWT', 
                identity: (decoded as any).sub, 
                payload: decoded
            };
            next();
        } catch (err) {
            const msg = "Invalid or expired JWT token";
            return res.status(STATUS).json({status: UNAUTHORIZED, message: msg});
        }
    }
    if (apiKeyHeader) {
        const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
        if (!apiKey.trim()) { 
            const msg = "API Key cannot be empty";
            res.status(STATUS).json({status: UNAUTHORIZED, message: msg});
            return;
        }
        req.authContext = { 
            strategy: 'API_KEY', 
            identity: apiKey, 
            payload: { apiKey }
        };
        return next();
    }
    const msg = "Authentication required. Provide a valid JWT Bearer token or x-api-key header.";
    res.status(STATUS).json({status: UNAUTHORIZED, message: msg}); 
    
};