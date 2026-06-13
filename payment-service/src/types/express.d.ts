import { Merchant } from '@prisma/client';
import { Request } from 'express';

declare global {
    namespace Express {
        export interface Request {
            merchant: Merchant;
        }
    }
}