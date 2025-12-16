class PaymentPlugin {
    constructor(config = {}) {
        this.pluginName = 'BasePaymentPlugin';
        this.config = config;
        this.isEnabled = true;
    }

    async initialize(config) {
        throw new Error('Method initialize() must be implemented by payment plugin');
    }

    async validateConfig() {
        throw new Error('Method validateConfig() must be implemented by payment plugin');
    }

    async processPayment(paymentData, transactionId) {
        throw new Error('Method processPayment() must be implemented by payment plugin');
    }

    async verifyPayment(verificationData, transactionId) {
        throw new Error('Method verifyPayment() must be implemented by payment plugin');
    }

    async cancelPayment(paymentId, reason, transactionId) {
        throw new Error('Method cancelPayment() must be implemented by payment plugin');
    }

    async refundPayment(paymentId, amount, reason, transactionId) {
        throw new Error('Method refundPayment() must be implemented by payment plugin');
    }

    async checkPaymentStatus(paymentId, transactionId) {
        return { status: 'unknown', message: 'checkPaymentStatus not implemented' };
    }

    async getFeeInfo(amount) {
        return { transactionFee: 0, total: amount };
    }

    getPluginInfo() {
        return {
            name: this.pluginName,
            version: '1.0.0',
            enabled: this.isEnabled,
            supportedCurrencies: ['VND'],
            supportedFeatures: []
        };
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    async cleanup() {
    }
}

export default PaymentPlugin;
