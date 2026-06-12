import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      
      authContext?: {
        strategy: 'JWT' | 'API_KEY';
        identity: string; 
        payload: any;
      };
    }
  }
}