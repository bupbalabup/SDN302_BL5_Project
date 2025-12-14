"use client";
import Loading from "@/components/shared/Loading";
import { USD_TO_VND_RATE } from "@/lib/constants";
import { getUserFromStorage } from "@/lib/utils";
import cartService from "@/services/cartService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AuctionPage from "../Auction/AuctionPage";

const QuantityCounter = ({ initialQuantity, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          onClick={handleDecrease}
          className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
          disabled={quantity <= 1}
        >
          -
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="w-8 text-center text-sm border-l border-r border-gray-300 py-1 focus:outline-none bg-white"
        />
        <button
          onClick={handleIncrease}
          className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-r-md"
        >
          +
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      const items = (data.cart?.items || []).map((item) => ({
        ...item,
        productId: item.productId._id || item.productId,
        variant: item.description || "N/A",
        price: parseFloat(item.price) || 0,
      }));
      setCart(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };
  const hanldeNavigate = () => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) return router.push("/login");
    router.push("/checkout");
  };

  const calculateSummary = () => {
    const totalItemsPriceUSD = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const subTotalUSD = totalItemsPriceUSD;

    return {
      totalItemsPriceUSD: totalItemsPriceUSD,
      subTotalUSD: subTotalUSD,
      totalItemsPriceVND: (totalItemsPriceUSD * USD_TO_VND_RATE).toLocaleString(
        "vi-VN"
      ),
      subTotalVND: (subTotalUSD * USD_TO_VND_RATE).toLocaleString("vi-VN"),
    };
  };

  const summary = calculateSummary();

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await cartService.updateCartItem(productId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await cartService.removeFromCart(productId);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("cart_updated", fetchCart);
    return () => {
      window.removeEventListener("cart_updated", fetchCart);
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white font-[Market Sans,Helvetica Neue,Helvetica,Arial,Roboto,sans-serif] flex flex-col items-center">
      <div className="flex justify-between items-center w-[90%] max-w-[1200px] py-6 border-b border-gray-300">
        <h1 className="text-[28px] font-bold text-gray-900">Shopping cart</h1>
        <a
          href="#"
          className="text-[#0654ba] text-sm font-medium hover:underline"
        ></a>
      </div>

      <div className="flex justify-between w-[90%] max-w-[1200px] mt-8 gap-10">
        {cart.length === 0 ? (
          <div className="flex flex-col w-[68%] space-y-6">
            <span className="italic">There are no products yet.</span>
          </div>
        ) : (
          <div className="flex flex-col w-[68%] space-y-6">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[14px] font-semibold">
                      {item.sellerId?.username || "N/A"}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="text-[#0654ba] text-sm font-medium hover:underline"
                  ></a>
                </div>

                <div className="flex justify-between gap-4">
                  <img
                    src={item?.images?.[0] || "/placeholder-image.jpg"}
                    alt={item?.title || "Product image"}
                    className="w-[110px] h-[110px] object-cover rounded-lg border"
                  />

                  <div className="flex flex-col flex-1">
                    <a
                      href="#"
                      className="text-[#0654ba] font-semibold mt-1 hover:underline leading-snug"
                    >
                      {item.title}
                    </a>

                    <p className="text-[13px] text-gray-600">{item.variant}</p>
                    <p className="text-[12px] text-gray-500 mt-2">
                      eBay International Shipping
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Returns accepted
                    </p>

                    <div className="flex gap-4 text-[13px] mt-2">
                      <a href="#" className="text-[#0654ba] hover:underline">
                        Buy it now
                      </a>

                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-[#0654ba] hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="text-right min-w-[180px]">
                    <div className="flex items-center justify-end gap-2">
                      <QuantityCounter
                        initialQuantity={item.quantity}
                        onQuantityChange={(newQuantity) =>
                          handleQuantityChange(item.productId, newQuantity)
                        }
                      />
                    </div>
                    <p className="font-semibold text-[15px] text-gray-900 mt-1">
                      US ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-[12px] text-gray-600">
                      (
                      {(
                        item.price *
                        item.quantity *
                        USD_TO_VND_RATE
                      ).toLocaleString("vi-VN")}{" "}
                      VND)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-[30%] flex flex-col space-y-4">
          {cart.length > 0 && (
            <div className="sticky top-8">
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <div className="text-[14px] text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Items (
                      {cart.reduce((total, item) => total + item.quantity, 0)})
                    </span>
                    <span>{summary.totalItemsPriceVND} VND</span>
                  </div>

                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-[18px]">
                    <span>Subtotal</span>
                    <span>{summary.subTotalVND} VND</span>
                  </div>
                </div>

                <button
                  onClick={hanldeNavigate}
                  className="w-full bg-[#3665f3] text-white font-semibold py-3 mt-5 rounded-full hover:bg-[#2954d2] transition-all duration-200"
                >
                  Go to checkout
                </button>

                <p className="text-[12px] text-gray-500 text-center mt-3">
                  Purchase protected by{" "}
                  <a href="#" className="text-[#0654ba] hover:underline">
                    eBay Money Back Guarantee
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <AuctionPage />
      </div>
    </div>
  );
};

export default Cart;
