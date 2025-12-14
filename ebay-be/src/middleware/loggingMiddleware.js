import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
    const transactionId = logger.constructor.generateTransactionId('REQ');
    req.transactionId = transactionId;

    const startTime = Date.now();

    logger.logRequest(
        req.method,
        req.originalUrl,
        transactionId,
        {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id || 'anonymous',
            body: req.body && Object.keys(req.body).length > 0 ? 'present' : 'empty'
        }
    );

    const originalSend = res.send;
    res.send = function (data) {
        const processingTime = Date.now() - startTime;

        logger.logResponse(
            req.method,
            req.originalUrl,
            res.statusCode,
            transactionId,
            {
                processingTime: `${processingTime}ms`,
                userId: req.user?.id || 'anonymous'
            }
        );

        originalSend.call(this, data);
    };

    next();
};

const errorLogger = (err, req, res, next) => {
    const transactionId = req.transactionId || 'NO-TX-ID';

    logger.error(
        'API-ERROR',
        `Error in ${req.method} ${req.originalUrl}`,
        transactionId,
        {
            error: err.message,
            stack: err.stack,
            statusCode: err.statusCode || 500,
            userId: req.user?.id || 'anonymous'
        }
    );

    next(err);
};

const transactionContext = (req, res, next) => {
    req.txContext = {
        transactionId: req.transactionId,

        logInfo: (module, message, metadata = {}) => {
            logger.info(module, message, req.transactionId, metadata);
        },

        logError: (module, message, error, metadata = {}) => {
            logger.error(
                module,
                message,
                req.transactionId,
                { ...metadata, error: error?.message, stack: error?.stack }
            );
        },

        logWarn: (module, message, metadata = {}) => {
            logger.warn(module, message, req.transactionId, metadata);
        },

        logDebug: (module, message, metadata = {}) => {
            logger.debug(module, message, req.transactionId, metadata);
        },

        logTransactionStart: (module, operation, metadata = {}) => {
            logger.logTransactionStart(module, req.transactionId, operation, metadata);
        },

        logTransactionSuccess: (module, operation, metadata = {}) => {
            logger.logTransactionSuccess(module, req.transactionId, operation, metadata);
        },

        logTransactionFailure: (module, operation, error, metadata = {}) => {
            logger.logTransactionFailure(module, req.transactionId, operation, error, metadata);
        }
    };

    next();
};

const performanceLogger = (threshold = 1000) => {
    return (req, res, next) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            if (duration > threshold) {
                logger.warn(
                    'PERFORMANCE',
                    `Slow request detected: ${req.method} ${req.originalUrl}`,
                    req.transactionId,
                    {
                        duration: `${duration}ms`,
                        threshold: `${threshold}ms`,
                        statusCode: res.statusCode
                    }
                );
            }
        });

        next();
    };
};

export {
    requestLogger,
    errorLogger,
    transactionContext,
    performanceLogger
};
