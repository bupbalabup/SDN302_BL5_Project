import Order from "../models/Order.js";
import ghnAxios from "../config/ghn.js";

export const getAvailableServices = async (toDistrictId) => {
    try {
        const payload = {
            shop_id: Number(process.env.GHN_SHOP_ID),
            from_district: Number(process.env.GHN_FROM_DISTRICT_ID),
            to_district: Number(toDistrictId),
        };

        console.log("📦 GHN payload:", payload);

        const res = await ghnAxios.post(
            "/v2/shipping-order/available-services",
            payload
        );

        return res.data.data;
    } catch (err) {
        console.log("🔥 GHN ERROR DATA:", err.response?.data);
        throw err;
    }
};

export const calculateShippingFee = async ({
    toDistrictId,
    toWardCode,
    weight,
    serviceId,
    serviceTypeId,
}) => {
    const payload = {
        service_id: serviceId,
        service_type_id: serviceTypeId,

        from_district_id: Number(process.env.GHN_FROM_DISTRICT_ID),
        to_district_id: Number(toDistrictId),
        to_ward_code: toWardCode,

        weight,
    };

    console.log("📦 GHN FEE payload:", payload);

    const res = await ghnAxios.post(
        "/v2/shipping-order/fee",
        payload
    );

    return res.data.data;
};

export const previewShippingFee = async ({
    toDistrictId,
    toWardCode,
}) => {
    const services = await getAvailableServices(toDistrictId);

    if (!services || services.length === 0) {
        throw new Error("No GHN services available");
    }

    // 🔥 auto chọn service rẻ nhất
    const service = services[0];

    const fee = await calculateShippingFee({
        toDistrictId,
        toWardCode,
        weight: 500,
        serviceId: service.service_id,
        serviceTypeId: service.service_type_id,
    });

    console.log("SERVICE CHOSEN:", service);
    console.log("GHN FEE RAW:", fee);


    return {
        fee,
        serviceId: service.service_id,
        serviceTypeId: service.service_type_id,
    };
};

/**
 * Map GHN status → Order status (FE xài)
 */
export const mapGHNToOrderStatus = (ghnStatus) => {
    switch (ghnStatus) {
        case "ready_to_pick":
        case "picking":
        case "picked":
        case "transporting":
        case "delivering":
            return "Shipped";

        case "delivered":
            return "Delivered";

        case "cancel":
            return "Canceled";

        case "return":
        case "returned":
            return "Returned";

        default:
            return "Processing";
    }
};

/**
 * Update order từ webhook GHN
 */
export const updateOrderFromGHNWebhook = async ({
    orderCode,
    ghnStatus,
}) => {
    const order = await Order.findOne({
        "shipping.orderCode": orderCode,
    });

    if (!order) return null;

    order.shipping.status = ghnStatus;
    order.status = mapGHNToOrderStatus(ghnStatus);

    await order.save();
    return order;
};

/**
 * Get order history + tracking link
 */
export const getOrderHistoryWithTracking = async (buyerId) => {
    const orders = await Order.find({ buyerId })
        .populate("items.productId")
        .populate("addressId")
        .sort({ createdAt: -1 });


    return orders.map((o) => ({
        _id: o._id,
        status: o.status,
        totalPrice: o.totalPrice,
        orderDate: o.orderDate,
        items: o.items,
        address: o.addressId,
        trackingUrl:
            o.shipping?.provider === "GHN" && o.shipping?.orderCode
                ? `https://donhang.ghn.vn/?order_code=${o.shipping.orderCode}`
                : null,
    }));
};

export const createGHNOrder = async ({
    order,
    address,
    items,
    serviceId,
    serviceTypeId,
    shippingFee,
}) => {
    const payload = {
        payment_type_id: 1, // shop trả ship
        note: "Đơn hàng từ hệ thống",
        required_note: "KHONGCHOXEMHANG",

        from_name: "SHOP NAME",
        from_phone: "0123456789",
        from_address: "Shop address",
        from_ward_name: "Ward",
        from_district_name: "District",
        from_province_name: "HCM",

        to_name: address.fullname,
        to_phone: address.phone,
        to_address: address.street,
        to_ward_code: address.wardCode,
        to_district_id: address.districtId,

        cod_amount: order.paymentMethod === "COD"
            ? order.totalPrice
            : 0,

        service_id: serviceId,
        service_type_id: serviceTypeId,

        weight: 500,
        length: 20,
        width: 20,
        height: 10,

        items: items.map(i => ({
            name: i.productName,
            quantity: i.quantity,
            weight: 500,
        })),
    };

    console.log("📦 GHN CREATE ORDER PAYLOAD:", payload);

    const res = await ghnAxios.post(
        "/v2/shipping-order/create",
        payload
    );

    return res.data.data;
};
