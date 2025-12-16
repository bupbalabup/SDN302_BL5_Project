import logger from '../utils/logger.js';
import StandardShippingPlugin from './StandardShippingPlugin.js';

class ShippingPluginManager {
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

            logger.logPluginRegistration('SHIPPING', pluginName, {
                isDefault,
                info: pluginInstance.getPluginInfo()
            });

            return true;
        } catch (error) {
            logger.error('ShippingPluginManager', `Failed to register plugin: ${pluginName}`, null, {
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

        logger.info('ShippingPluginManager', `Unregistered plugin: ${pluginName}`);
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

    async calculateShippingRate(pluginName, shippingData, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.calculateShippingRate(shippingData, transactionId);
    }

    async createShipment(pluginName, shipmentData, orderId, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.createShipment(shipmentData, orderId, transactionId);
    }

    async trackShipment(pluginName, trackingNumber, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.trackShipment(trackingNumber, transactionId);
    }

    async cancelShipment(pluginName, trackingNumber, reason, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.cancelShipment(trackingNumber, reason, transactionId);
    }

    async updateShipment(pluginName, trackingNumber, updateData, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.updateShipment(trackingNumber, updateData, transactionId);
    }

    async getEstimatedDelivery(pluginName, shippingData, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.getEstimatedDelivery(shippingData, transactionId);
    }

    async getPickupPoints(pluginName, location, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.getPickupPoints(location, transactionId);
    }

    async printLabel(pluginName, trackingNumber, format, transactionId) {
        const plugin = this.getPlugin(pluginName);
        return await plugin.printLabel(trackingNumber, format, transactionId);
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
        logger.info('ShippingPluginManager', `Plugin ${pluginName} ${enabled ? 'enabled' : 'disabled'}`);
    }

    async getAvailableShippingOptions(shippingData, transactionId) {
        const options = [];

        for (const [name, plugin] of this.plugins) {
            if (!plugin.isEnabled) continue;

            try {
                const rateResult = await plugin.calculateShippingRate(shippingData, transactionId);
                if (rateResult.success) {
                    options.push({
                        provider: name,
                        ...rateResult,
                        isDefault: name === this.defaultPlugin
                    });
                }
            } catch (error) {
                logger.warn('ShippingPluginManager', `Failed to get rate from ${name}`, transactionId, {
                    error: error.message
                });
            }
        }

        return options;
    }
}

const shippingPluginManager = new ShippingPluginManager();

(async () => {
    try {
        const standardPlugin = new StandardShippingPlugin();
        await shippingPluginManager.registerPlugin('Standard', standardPlugin, true);

        logger.info('ShippingPluginManager', 'All shipping plugins registered successfully');
    } catch (error) {
        logger.error('ShippingPluginManager', 'Failed to register default plugins', null, {
            error: error.message
        });
    }
})();

export default shippingPluginManager;
