import axios from "axios";
import api from "@/services";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * =====================
 * GHN MASTER DATA
 * =====================
 */

export const getGHNProvinces = async () => {
  const res = await axios.get(`${API_URL}/api/shipping/ghn/provinces`);
  return res.data;
};

export const getGHNDistricts = async (provinceId) => {
  const res = await axios.get(
    `${API_URL}/api/shipping/ghn/districts/${provinceId}`
  );
  return res.data;
};

export const getGHNWards = async (districtId) => {
  const res = await axios.get(
    `${API_URL}/api/shipping/ghn/wards/${districtId}`
  );
  return res.data;
};

/**
 * =====================
 * CHECKOUT PREVIEW
 * =====================
 */
export const previewShippingFee = async (addressId) => {
  if (!addressId) throw new Error("Missing addressId");

  const res = await api.post("/shipping/checkout-preview", { addressId });

  return res.data;
};

