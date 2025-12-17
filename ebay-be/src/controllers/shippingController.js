import {
    updateOrderFromGHNWebhook,
    getOrderHistoryWithTracking,
    calculateShippingFee,
    getAvailableServices,
    previewShippingFee,
} from "../services/shippingService.js";

import ghnAxios from "../config/ghn.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

/**
 * =========================
 * GHN MASTER DATA
 * =========================
 */
export const getGHNProvinces = async (req, res) => {
    try {
        const { data } = await ghnAxios.get("/master-data/province");
        res.json(data.data);
    } catch (err) {
        res.status(500).json({ message: "Load GHN provinces failed" });
    }
};

export const getGHNDistricts = async (req, res) => {
    try {
        const { provinceId } = req.params;
        const { data } = await ghnAxios.post("/master-data/district", {
            province_id: Number(provinceId),
        });
        res.json(data.data);
    } catch {
        res.status(500).json({ message: "Load GHN districts failed" });
    }
};

export const getGHNWards = async (req, res) => {
    try {
        const { districtId } = req.params;
        const { data } = await ghnAxios.post("/master-data/ward", {
            district_id: Number(districtId),
        });
        res.json(data.data);
    } catch {
        res.status(500).json({ message: "Load GHN wards failed" });
    }
};

/**
 * =========================
 * GHN SERVICES
 * =========================
 */
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

/**
 * =========================
 * CHECKOUT PREVIEW (FE)
 * =========================
 */
export const checkoutPreview = async (req, res) => {
    try {
        const { addressId } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: "addressId is required" });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (!address.districtId || !address.wardCode) {
            return res.status(400).json({
                message: "Address missing districtId or wardCode",
            });
        }

        const shipping = await previewShippingFee({
            toDistrictId: address.districtId,
            toWardCode: address.wardCode,
        });

        return res.json({
            shippingFee: shipping.fee.total,
            serviceId: shipping.serviceId,
            serviceTypeId: shipping.serviceTypeId,
            weight: 500,
        });
    } catch (err) {
        console.error("Checkout preview error:", err);
        return res.status(500).json({
            message: "Shipping preview failed",
            error: err.message,
        });
    }
};

/**
 * =========================
 * CALCULATE SHIPPING FEE
 * =========================
 */
export const calculateShippingFeeController = async (req, res) => {
    try {
        const { districtId, wardCode, weight, serviceId, serviceTypeId } = req.body;

        if (!districtId || !wardCode || !weight || !serviceId || !serviceTypeId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const fee = await calculateShippingFee({
            toDistrictId: districtId,
            toWardCode: wardCode,
            weight,
            serviceId,
            serviceTypeId,
        });

        res.json({ fee });
    } catch (err) {
        res.status(400).json({ message: "GHN error", ghn: err.response?.data });
    }
};

/**
 * =========================
 * GHN WEBHOOK
 * =========================
 */
export const ghnWebhook = async (req, res) => {
    try {
        const { order_code, status } = req.body;
        if (!order_code || !status) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        await updateOrderFromGHNWebhook({
            orderCode: order_code,
            ghnStatus: status,
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * =========================
 * ORDER HISTORY
 * =========================
 */
export const getMyOrderHistory = async (req, res) => {
    try {
        const orders = await getOrderHistoryWithTracking(req.userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
