import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    constructor() {
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };

        this.currentLevel = process.env.LOG_LEVEL
            ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()]
            : this.logLevels.INFO;

        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatLogMessage(level, module, message, transactionId = null, metadata = {}) {
        const timestamp = new Date().toISOString();
        const txId = transactionId || 'NO-TX-ID';

        const logObject = {
            timestamp,
            level,
            module,
            transactionId: txId,
            message,
            ...metadata
        };

        const consoleMessage = `[${timestamp}] [${level}] [${module}] [${txId}] ${message}`;

        return {
            console: consoleMessage,
            file: JSON.stringify(logObject)
        };
    }

    writeToFile(level, content) {
        const date = new Date().toISOString().split('T')[0];
        const filename = `${level.toLowerCase()}-${date}.log`;
        const filepath = path.join(this.logDir, filename);

        fs.appendFileSync(filepath, content + '\n', 'utf8');
    }

    log(level, module, message, transactionId = null, metadata = {}) {
        const levelValue = this.logLevels[level];

        if (levelValue < this.currentLevel) {
            return;
        }

        const formatted = this.formatLogMessage(level, module, message, transactionId, metadata);

        const color = this.getColorForLevel(level);
        console.log(color, formatted.console, '\x1b[0m');

        if (level === 'ERROR' || level === 'WARN') {
            this.writeToFile(level, formatted.file);
        }

        if (process.env.LOG_ALL_TO_FILE === 'true') {
            const allLogPath = path.join(this.logDir, 'all.log');
            fs.appendFileSync(allLogPath, formatted.file + '\n', 'utf8');
        }
    }

    getColorForLevel(level) {
        const colors = {
            DEBUG: '\x1b[36m', // Cyan
            INFO: '\x1b[32m',  // Green
            WARN: '\x1b[33m',  // Yellow
            ERROR: '\x1b[31m'  // Red
        };
        return colors[level] || '\x1b[0m';
    }

    debug(module, message, transactionId = null, metadata = {}) {
        this.log('DEBUG', module, message, transactionId, metadata);
    }

    info(module, message, transactionId = null, metadata = {}) {
        this.log('INFO', module, message, transactionId, metadata);
    }

    warn(module, message, transactionId = null, metadata = {}) {
        this.log('WARN', module, message, transactionId, metadata);
    }

    error(module, message, transactionId = null, metadata = {}) {
        this.log('ERROR', module, message, transactionId, metadata);
    }

    logTransactionStart(module, transactionId, operation, metadata = {}) {
        this.info(
            module,
            `Transaction started: ${operation}`,
            transactionId,
            { ...metadata, operation, status: 'started' }
        );
    }

    logTransactionSuccess(module, transactionId, operation, metadata = {}) {
        this.info(
            module,
            `Transaction completed: ${operation}`,
            transactionId,
            { ...metadata, operation, status: 'success' }
        );
    }

    logTransactionFailure(module, transactionId, operation, error, metadata = {}) {
        this.error(
            module,
            `Transaction failed: ${operation}`,
            transactionId,
            {
                ...metadata,
                operation,
                status: 'failed',
                error: error.message,
                stack: error.stack
            }
        );
    }

    logRequest(method, url, transactionId, metadata = {}) {
        this.info(
            'API',
            `${method} ${url}`,
            transactionId,
            { ...metadata, type: 'request' }
        );
    }

    logResponse(method, url, statusCode, transactionId, metadata = {}) {
        const level = statusCode >= 400 ? 'WARN' : 'INFO';
        this.log(
            level,
            'API',
            `${method} ${url} - ${statusCode}`,
            transactionId,
            { ...metadata, type: 'response', statusCode }
        );
    }

    logPayment(transactionId, paymentMethod, amount, status, metadata = {}) {
        this.info(
            'PAYMENT',
            `Payment ${status}: ${paymentMethod} - ${amount} VND`,
            transactionId,
            { ...metadata, paymentMethod, amount, status }
        );
    }

    logShipping(transactionId, orderId, status, metadata = {}) {
        this.info(
            'SHIPPING',
            `Shipping ${status} for order ${orderId}`,
            transactionId,
            { ...metadata, orderId, status }
        );
    }

    logPluginRegistration(pluginType, pluginName, metadata = {}) {
        this.info(
            'PLUGIN',
            `Registered ${pluginType} plugin: ${pluginName}`,
            null,
            { ...metadata, pluginType, pluginName }
        );
    }

    static generateTransactionId(prefix = 'TX') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}

const logger = new Logger();

export default logger;
