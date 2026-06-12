
export const HTTP_ERRORS = {
  SERVICE_UNAVAILABLE: {
    CODE: 'ECONNREFUSED',
    STATUS: 503,
    ERROR_TEXT: 'Service Unavailable',
    MESSAGE: 'The payment service is temporarily down. Please try again later.'
  },
  GATEWAY_TIMEOUT: {
    CODE: 'ECONNABORTED',
    STATUS: 504,
    ERROR_TEXT: 'Gateway Timeout',
    MESSAGE: 'The payment service took too long to respond. Connection aborted.'
  },
  BAD_GATEWAY: {
    CODE: 'BAD_GATEWAY',
    STATUS: 502,
    ERROR_TEXT: 'Bad Gateway',
    MESSAGE: 'An error occurred while communicating with the internal payment service.'
  },
  RATE_LIMIT: {
    STATUS: 429,
    ERROR_TEXT: 'Too Many Requests',
    MESSAGE_TEMPLATE: 'Rate limit exceeded. Maximum'
  }
};

export const PROXY_CONFIG = {
  TIMEOUT_MS: 10000,
  DEFAULT_CONTENT_TYPE: 'application/json'
};