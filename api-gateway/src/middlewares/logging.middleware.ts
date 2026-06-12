import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = Math.round((diff[0] * 1e3) + (diff[1] / 1e6));

        const timestamp = new Date().toISOString();

        const { method, originalUrl } = req;
        const statusCode = res.statusCode;

        console.log(`[${timestamp}] [${method} ${originalUrl}] ${statusCode} - ${durationMs}ms`);
    });
    next();
};