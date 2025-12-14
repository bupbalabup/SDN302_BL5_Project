export const getCartLocal = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart_local") || "[]");
};

export const saveCartLocal = (cart) => {
  localStorage.setItem("cart_local", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart_updated"));
};

export const addToCartLocal = (product, quantity = 1) => {
  const cart = getCartLocal();
  const index = cart.findIndex((i) => i.productId === product._id);
  if (index > -1) cart[index].quantity += quantity;
  else
    cart.push({
      productId: product._id,
      name: product.name,
      images: product.images,
      price: product.price,
      description: product.description,
      sellerId: product.sellerId,
      quantity,
    });
  saveCartLocal(cart);
};

export const updateCartItemLocal = (productId, quantity) => {
  if (quantity < 1) return;
  const cart = getCartLocal();
  const index = cart.findIndex((i) => i.productId === productId);

  if (index > -1) {
    cart[index].quantity = quantity;
    saveCartLocal(cart);
  }
};

export const removeFromCartLocal = (productId) => {
  const cart = getCartLocal();
  const newCart = cart.filter((item) => item.productId !== productId);
  saveCartLocal(newCart);
};

export const clearCartLocal = () => {
  localStorage.removeItem("cart_local");
  window.dispatchEvent(new Event("cart_updated"));
};

export const syncLocalCartToServer = async (api, getCartService) => {
  const localCart = getCartLocal();
  if (localCart.length === 0) return;

  try {
    const serverCartData = await getCartService();
    const serverItems = serverCartData.cart?.items || [];

    if (serverItems.length > 0) {
      console.log(
        "Giỏ hàng server đã có items. Giữ lại local cart và không đồng bộ."
      );
      return;
    }

    console.log("Giỏ hàng server chưa có items. Bắt đầu đồng bộ local cart...");
    for (const item of localCart) {
      await api.post("/cart/add", {
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    clearCartLocal();
    console.log("Cart local đã được đồng bộ lên server và đã xóa local cart!");

    window.dispatchEvent(new Event("cart_updated"));
  } catch (error) {
    console.error("Error syncing cart", error);
  }
};
