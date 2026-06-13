import express, {Application, json, urlencoded} from 'express';
import cors from 'cors';
import { ENV } from './config/environment';
import proxyRouter from './routes/proxy.routes';

import { loggingMiddleware } from './middlewares/logging.middleware';
import { rateLimiterMiddleware } from './middlewares/rate-limiter.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

const app: Application = express();

// app.use(json({ limit: '10mb' }));
// app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(loggingMiddleware);
app.use(rateLimiterMiddleware);
app.use(authMiddleware);
app.use(express.json());
app.use('/api/v1', proxyRouter);

app.get('/api/health', (_req, res) => {
    res.status(200).json({status: 'success', message: 'API Gateway is running!'});
});

app.listen(ENV.PORT, () => {
    console.log(`[API Gateway] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
});

export default app;