import { updateOrderFromGHNWebhook, getOrderHistoryWithTracking, calculateShippingFee, getAvailableServices, previewShippingFee } from "../services/shippingService.js";
import ghnAxios from "../config/ghn.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

export const getShippingServices = async (req, res) => {
    try {
        const { districtId } = req.query;

        if (!districtId) {
            return res.status(400).json({ message: "districtId required" });
        }

        const services = await getAvailableServices(Number(districtId));
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: "GHN error", error: err.message });
    }
};

export const checkoutPreview = async (req, res) => {
    try {
        const { addressId } = req.body;

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const shipping = await previewShippingFee({
            toDistrictId: address.districtId,
            toWardCode: address.wardCode,
        });

        res.json({
            success: true,
            shippingFee: shipping.fee.total,
            serviceId: shipping.serviceId,
            serviceTypeId: shipping.serviceTypeId,
            weight: 500,
        });
    } catch (err) {
        console.error("🔥 CHECKOUT PREVIEW ERROR:", err.message);
        res.status(400).json({ message: err.message });
    }
};

export const calculateShippingFeeController = async (req, res) => {
    try {
        const {
            districtId,
            wardCode,
            weight,
            serviceId,
            serviceTypeId,
        } = req.body;

        if (!districtId || !wardCode || !weight || !serviceId || !serviceTypeId) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        const fee = await calculateShippingFee({
            toDistrictId: districtId,
            toWardCode: wardCode,
            weight,
            serviceId,
            serviceTypeId,
        });

        res.json({
            success: true,
            fee,
        });
    } catch (err) {
        console.error("🔥 GHN ERROR:", err.response?.data || err.message);
        res.status(400).json({
            message: "GHN error",
            ghn: err.response?.data,
        });
    }
};

/**
 * GHN WEBHOOK
 * GHN sẽ POST order_code + status
 */
export const ghnWebhook = async (req, res) => {
    try {
        const token = req.headers["token"];

        // // 🔐 Verify webhook token
        // if (token !== process.env.GHN_WEBHOOK_TOKEN) {
        //     return res.status(401).json({ message: "Invalid GHN token" });
        // }

        const { order_code, status } = req.body;

        if (!order_code || !status) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        const order = await updateOrderFromGHNWebhook({
            orderCode: order_code,
            ghnStatus: status,
        });

        if (!order) {
            return res.json({ success: true });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * ORDER HISTORY (Buyer)
 */
export const getMyOrderHistory = async (req, res) => {
    try {
        const buyerId = req.userId; // từ auth middleware

        const orders = await getOrderHistoryWithTracking(buyerId);

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
