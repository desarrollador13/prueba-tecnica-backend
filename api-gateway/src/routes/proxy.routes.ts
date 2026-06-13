import { Router, Request, Response } from 'express';
import axios from 'axios';
import { ENV } from '../config/environment';    
import { HTTP_ERRORS, PROXY_CONFIG } from '../common/constants/http-error.constants';

const proxyRouter = Router();

const routerPaymentService = async (req: Request, res: Response) => {
    const url = `${ENV.PAYMENT_SERVICE_URL}${req.originalUrl}`;
    console.log(url);
    console.log("body " + JSON.stringify(req.body));
    console.log('method ' + req.method)
    console.log("api keyv " + req.headers['x-api-key'])
    console.log('data ' + req.headers['content-type'])
    try {
        const response = await axios({
            method: req.method,
            url,
            data: req.body,
            headers: {
                'x-api-key': req.headers['x-api-key'],
                'authorization': req.headers['authorization'],
                'content-type': req.headers['content-type'] || PROXY_CONFIG.DEFAULT_CONTENT_TYPE
            },
            timeout: PROXY_CONFIG.TIMEOUT_MS,
        });
        res.status(response.status).json(response.data);
    } catch (error: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [Axios Proxy Error] URL: ${req.method} ${req.originalUrl} - Message: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
            return;
        }
        if (error.code === HTTP_ERRORS.SERVICE_UNAVAILABLE.CODE) {
            res.status(HTTP_ERRORS.SERVICE_UNAVAILABLE.STATUS).json({
                error: HTTP_ERRORS.SERVICE_UNAVAILABLE.ERROR_TEXT,
                message: HTTP_ERRORS.SERVICE_UNAVAILABLE.MESSAGE
            });
            return;
        }
        if (error.code === HTTP_ERRORS.GATEWAY_TIMEOUT.CODE) {
            res.status(HTTP_ERRORS.GATEWAY_TIMEOUT.STATUS).json({
                error: HTTP_ERRORS.GATEWAY_TIMEOUT.ERROR_TEXT,
                message: HTTP_ERRORS.GATEWAY_TIMEOUT.MESSAGE
            });
            return;
        }
        if (error.code === HTTP_ERRORS.BAD_GATEWAY.CODE) {
            res.status(HTTP_ERRORS.BAD_GATEWAY.STATUS).json({
                error: HTTP_ERRORS.BAD_GATEWAY.ERROR_TEXT,
                message: HTTP_ERRORS.BAD_GATEWAY.MESSAGE
            });
            return;
        }
        res.status(HTTP_ERRORS.BAD_GATEWAY.STATUS).json({
            error: HTTP_ERRORS.BAD_GATEWAY.ERROR_TEXT,
            message: HTTP_ERRORS.BAD_GATEWAY.MESSAGE
        });
    }
};

proxyRouter.all('/transactions/*', routerPaymentService);
proxyRouter.all('/settlements/*', routerPaymentService);

export default proxyRouter;
