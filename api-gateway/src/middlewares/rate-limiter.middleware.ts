import { Request, Response, NextFunction } from 'express';
import { RateLimitRecord } from '../common/interfaces/rate-limit.interface';

const ipRegistry = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 100;

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const extendedReq = req as any;
  const clientKey = extendedReq.authContext?.identity || req.ip || 'unknown_client';
  const RATE_LIMIT_STATUS = 429;
  const RATE_LIMIT_ERROR_TEXT = 'Too Many Requests';
  const RATE_LIMIT_MESSAGE_TEMPLATE = 'Rate limit exceeded. Maximum';

  const currentTime = Date.now();
  const record = ipRegistry.get(clientKey);

  if (!record) {
    ipRegistry.set(clientKey, { count: 1, resetTime: currentTime + WINDOW_MS });
    return next();
  }

  if (currentTime > record.resetTime) {
    record.count = 1;
    record.resetTime = currentTime + WINDOW_MS;
    ipRegistry.set(clientKey, record);
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    const timeLeft = Math.ceil((record.resetTime - currentTime) / 1000);
    
    res.setHeader('Retry-After', timeLeft);

    res.status(RATE_LIMIT_STATUS).json({
      error: RATE_LIMIT_ERROR_TEXT,
      message: `${RATE_LIMIT_MESSAGE_TEMPLATE} ${MAX_REQUESTS} requests per minute.`,
      retryAfterSeconds: timeLeft
    });
    return;
  }

  record.count += 1;
  ipRegistry.set(clientKey, record);
  next();
};


setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRegistry.entries()) {
    if (now > record.resetTime) {
      ipRegistry.delete(key);
    }
  }
}, 5 * 60 * 1000); 