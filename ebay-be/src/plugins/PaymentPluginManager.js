import logger from '../utils/logger.js';
import PayPalPaymentPlugin from './PayPalPaymentPlugin.js';

class PaymentPluginManager {
    constructor() {
        this.plugins = new Map();
        this.defaultPlugin = null;
    }

    async registerPlugin(pluginName, pluginInstance, isDefault = false) {
        try {
            await pluginInstance.validateConfig();
            await pluginInstance.initialize(pluginInstance.config);

            this.plugins.set(pluginName, pluginInstance);

            if (isDefault) {
                this.defaultPlugin = pluginName;
            }

            logger.logPluginRegistration('PAYMENT', pluginName, {
                isDefault,
                info: pluginInstance.getPluginInfo()
            });

            return true;
        } catch (error) {
            logger.error('PaymentPluginManager', `Failed to register plugin: ${pluginName}`, null, {
                error: error.message
            });
            throw error;
        }
    }

    async unregisterPlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }

        await plugin.cleanup();
        this.plugins.delete(pluginName);

        if (this.defaultPlugin === pluginName) {
            this.defaultPlugin = null;
        }

        logger.info('PaymentPluginManager', `Unregistered plugin: ${pluginName}`);
    }

    getPlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }
        if (!plugin.isEnabled) {
            throw new Error(`Plugin ${pluginName} is disabled`);
        }
        return plugin;
    }

    async processPayment(pluginName, paymentData, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.processPayment(paymentData, transactionId);
    }

    async verifyPayment(pluginName, verificationData, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.verifyPayment(verificationData, transactionId);
    }

    async cancelPayment(pluginName, paymentId, reason, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.cancelPayment(paymentId, reason, transactionId);
    }

    async refundPayment(pluginName, paymentId, amount, reason, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.refundPayment(paymentId, amount, reason, transactionId);
    }

    async checkPaymentStatus(pluginName, paymentId, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.checkPaymentStatus(paymentId, transactionId);
    }

    async getFeeInfo(pluginName, amount) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.getFeeInfo(amount);
    }

    listPlugins() {
        const pluginList = [];
        for (const [name, plugin] of this.plugins) {
            pluginList.push({
                name,
                isDefault: name === this.defaultPlugin,
                ...plugin.getPluginInfo()
            });
        }
        return pluginList;
    }

    setPluginEnabled(pluginName, enabled) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }
        plugin.setEnabled(enabled);
        logger.info('PaymentPluginManager', `Plugin ${pluginName} ${enabled ? 'enabled' : 'disabled'}`);
    }
}

const paymentPluginManager = new PaymentPluginManager();

(async () => {
    try {
        const paypalPlugin = new PayPalPaymentPlugin();
        await paymentPluginManager.registerPlugin('PayPal', paypalPlugin, true);

        logger.info('PaymentPluginManager', 'Payment plugins registered successfully');
    } catch (error) {
        logger.error('PaymentPluginManager', 'Failed to register plugins', null, {
            error: error.message
        });
    }
})();

export default paymentPluginManager;
