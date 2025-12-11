import {
  addToCartLocal,
  getCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  clearCartLocal,
} from "@/lib/cartLocal";
import { getUserFromStorage } from "@/lib/utils";
import api from "@/services";

const cartService = {
  getCart: async () => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      return { success: true, cart: { items: getCartLocal() } };
    }
    try {
      const res = await api.get("/cart");
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addToCart: async (product, quantity = 1) => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      addToCartLocal(product, quantity);
      return { success: true, local: true };
    }
    try {
      const res = await api.post("/cart/add", {
        productId: product._id,
        quantity,
      });
      console.log(res.data);
      window.dispatchEvent(new Event("cart_updated"));
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      updateCartItemLocal(productId, quantity);
      return { success: true, local: true };
    }
    try {
      const res = await api.patch("/cart/update", { productId, quantity });
      window.dispatchEvent(new Event("cart_updated"));
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeFromCart: async (productId) => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      removeFromCartLocal(productId);
      return { success: true, local: true };
    }

    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      window.dispatchEvent(new Event("cart_updated"));
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  clearCart: async () => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      clearCartLocal();
      return { success: true, local: true };
    }

    try {
      const res = await api.delete("/cart/clear");
      window.dispatchEvent(new Event("cart_updated"));
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCartForCheckout: async () => {
    try {
      const res = await api.get("/cart/by-seller");
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await api.post("/cart/apply-coupon", { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default cartService;
