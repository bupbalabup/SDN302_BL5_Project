import PaymentPlugin from './PaymentPlugin.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/*  Implements PaymentPlugin interface for PayPal payment method */
class PayPalPaymentPlugin extends PaymentPlugin {
    constructor(config = {}) {
        super(config);
        this.pluginName = 'PayPalPaymentPlugin';
        this.config = {
            clientId: config.clientId || process.env.PAYPAL_CLIENT_ID,
            clientSecret: config.clientSecret || process.env.PAYPAL_CLIENT_SECRET,
            mode: config.mode || 'sandbox', // sandbox or live
            currency: config.currency || 'VND',
            returnUrl: config.returnUrl || process.env.PAYPAL_RETURN_URL,
            cancelUrl: config.cancelUrl || process.env.PAYPAL_CANCEL_URL,
            ...config
        };
    }

    async initialize(config) {
        this.config = { ...this.config, ...config };
        logger.logPluginRegistration('PAYMENT', this.pluginName, {
            mode: this.config.mode,
            currency: this.config.currency
        });
        return true;
    }

    async validateConfig() {
        if (!this.config.clientId) {
            this.config.clientId = 'sandbox_client_id';
        }
        if (!this.config.clientSecret) {
            this.config.clientSecret = 'sandbox_client_secret';
        }
        return true;
    }

    async simulatePayPalAPI(endpoint, data, transactionId) {
        logger.debug('PayPalPaymentPlugin', `Simulating PayPal API call to ${endpoint}`, transactionId, data);

        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            data: {
                id: `PAYPAL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
                status: 'COMPLETED',
                ...data
            }
        };
    }

    async processPayment(paymentData, transactionId) {
        logger.logTransactionStart('PayPalPaymentPlugin', transactionId, 'processPayment', {
            amount: paymentData.amount,
            orderId: paymentData.orderId
        });

        try {
            const { amount, orderId, buyerId, paymentDetails } = paymentData;

            const paypalResponse = await this.simulatePayPalAPI('/v2/checkout/orders', {
                intent: 'CAPTURE',
                amount: {
                    currency_code: this.config.currency,
                    value: amount
                },
                orderId
            }, transactionId);

            const gatewayTransactionId = paypalResponse.data.id;

            const redirectUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${gatewayTransactionId}`;

            const result = {
                success: true,
                transactionId,
                paymentId: null,
                status: 'pending',
                gatewayTransactionId,
                redirectUrl,
                message: 'Please complete payment on PayPal',
                additionalData: {
                    paymentMethod: 'PayPal',
                    mode: this.config.mode,
                    approvalUrl: redirectUrl
                },
                processingTime: Date.now()
            };

            logger.logPayment(transactionId, 'PayPal', amount, result.status, {
                orderId,
                buyerId,
                gatewayTransactionId
            });

            logger.logTransactionSuccess('PayPalPaymentPlugin', transactionId, 'processPayment', {
                status: result.status,
                gatewayTransactionId
            });

            return result;
        } catch (error) {
            logger.logTransactionFailure('PayPalPaymentPlugin', transactionId, 'processPayment', error, {
                amount: paymentData.amount,
                orderId: paymentData.orderId
            });
            throw error;
        }
    }

    async verifyPayment(verificationData, transactionId) {
        logger.logTransactionStart('PayPalPaymentPlugin', transactionId, 'verifyPayment', {
            gatewayTransactionId: verificationData.gatewayTransactionId
        });

        try {
            const { gatewayTransactionId, payerId } = verificationData;

            const captureResponse = await this.simulatePayPalAPI(
                `/v2/checkout/orders/${gatewayTransactionId}/capture`,
                { payerId },
                transactionId
            );

            const result = {
                isValid: captureResponse.success,
                status: captureResponse.data.status === 'COMPLETED' ? 'completed' : 'failed',
                message: 'PayPal payment verified successfully',
                data: captureResponse.data
            };

            logger.logTransactionSuccess('PayPalPaymentPlugin', transactionId, 'verifyPayment', {
                gatewayTransactionId,
                status: result.status
            });

            return result;
        } catch (error) {
            logger.logTransactionFailure('PayPalPaymentPlugin', transactionId, 'verifyPayment', error, {
                gatewayTransactionId: verificationData.gatewayTransactionId
            });
            throw error;
        }
    }

    async cancelPayment(paymentId, reason, transactionId) {
        logger.logTransactionStart('PayPalPaymentPlugin', transactionId, 'cancelPayment', {
            paymentId,
            reason
        });

        try {
            await this.simulatePayPalAPI(
                `/v2/checkout/orders/${paymentId}/cancel`,
                { reason },
                transactionId
            );

            const result = {
                success: true,
                status: 'cancelled',
                message: 'PayPal payment cancelled successfully'
            };

            logger.logTransactionSuccess('PayPalPaymentPlugin', transactionId, 'cancelPayment', {
                paymentId,
                reason
            });

            return result;
        } catch (error) {
            logger.logTransactionFailure('PayPalPaymentPlugin', transactionId, 'cancelPayment', error, {
                paymentId,
                reason
            });
            throw error;
        }
    }

    async refundPayment(paymentId, amount, reason, transactionId) {
        logger.logTransactionStart('PayPalPaymentPlugin', transactionId, 'refundPayment', {
            paymentId,
            amount,
            reason
        });

        try {
            const refundResponse = await this.simulatePayPalAPI(
                `/v2/payments/captures/${paymentId}/refund`,
                {
                    amount: {
                        currency_code: this.config.currency,
                        value: amount
                    },
                    note_to_payer: reason
                },
                transactionId
            );

            const result = {
                success: true,
                refundedAmount: amount,
                refundId: refundResponse.data.id,
                status: 'refunded',
                message: 'PayPal refund processed successfully'
            };

            logger.logTransactionSuccess('PayPalPaymentPlugin', transactionId, 'refundPayment', {
                paymentId,
                refundedAmount: amount,
                refundId: result.refundId
            });

            return result;
        } catch (error) {
            logger.logTransactionFailure('PayPalPaymentPlugin', transactionId, 'refundPayment', error, {
                paymentId,
                amount,
                reason
            });
            throw error;
        }
    }

    async checkPaymentStatus(paymentId, transactionId) {
        logger.debug('PayPalPaymentPlugin', 'Checking payment status', transactionId, { paymentId });

        try {
            const statusResponse = await this.simulatePayPalAPI(
                `/v2/checkout/orders/${paymentId}`,
                {},
                transactionId
            );

            return {
                status: statusResponse.data.status.toLowerCase(),
                gatewayStatus: statusResponse.data.status,
                details: statusResponse.data
            };
        } catch (error) {
            logger.error('PayPalPaymentPlugin', 'Failed to check payment status', transactionId, {
                paymentId,
                error: error.message
            });
            return { status: 'unknown', message: error.message };
        }
    }

    async getFeeInfo(amount) {
        const transactionFee = Math.round(amount * 0.039 + 7000);
        return {
            transactionFee,
            total: amount + transactionFee,
            breakdown: {
                percentageFee: Math.round(amount * 0.039),
                fixedFee: 7000
            }
        };
    }

    getPluginInfo() {
        return {
            name: this.pluginName,
            version: '1.0.0',
            enabled: this.isEnabled,
            supportedCurrencies: ['VND', 'USD', 'EUR'],
            supportedFeatures: ['payment', 'verification', 'cancellation', 'refund', 'status-check'],
            mode: this.config.mode
        };
    }
}

export default PayPalPaymentPlugin;
