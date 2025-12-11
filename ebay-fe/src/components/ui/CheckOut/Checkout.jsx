"use client";

import { SHIPPING_TOTAL_USD, USD_TO_VND_RATE } from "@/lib/constants";
import React, { useState, useEffect } from "react";
import cartService from "@/services/cartService";
import orderService from "@/services/orderService";
import { getAddresses } from "@/services/addressService";
import ShipTo from "@/components/ui/CheckOut/ShipTo";
import { useRouter } from "next/navigation";
import { getUserFromStorage } from "@/lib/utils";
import Loading from "@/components/shared/Loading";
import useModal from "../../../../hooks/useModal";
import AlertModal from "@/components/shared/AlertModal";
import FakePayPalModal from "./FakePayPalModal";

// IMPORT FAKE PAYPAL MODAL

const Checkout = ({ cart = {}, coupons = [], onCartUpdate }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");

  const [appliedCouponData, setAppliedCouponData] = useState(null);

  const cartItems = cart.items || [];
  const totalItemsCount = cart.totalItems || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("PAYPAL");

  // PayPal Modal
  const [isPayPalModalOpen, setPayPalModalOpen] = useState(false);

  // Modal system
  const { isOpen, modalContent, showModal, hideModal, handleConfirm } =
    useModal();

  // ===== FETCH ADDRESSES =====
  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);

      const defaultAddress = data.find((addr) => addr.isDefault) || data[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const storedUser = getUserFromStorage(localStorage, sessionStorage);
    setUser(storedUser);
  }, []);

  if (!user) {
    return <Loading />;
  }

  // ===== PRICE CALCULATION =====
  const baseSubtotalUSD = parseFloat(cart.subtotal) || 0;
  const baseDiscountUSD = parseFloat(cart.discountTotal) || 0;
  const shippingUSD = SHIPPING_TOTAL_USD;

  const currentSubtotalUSD = appliedCouponData
    ? appliedCouponData.cartTotal
    : baseSubtotalUSD;

  const currentDiscountUSD = appliedCouponData
    ? appliedCouponData.discountAmount
    : baseDiscountUSD;

  const currentTotalUSD = currentSubtotalUSD + shippingUSD - currentDiscountUSD;

  const isAddressSelected = selectedAddressId !== null;
  const selectedAddress = addresses.find(
    (addr) => addr._id === selectedAddressId
  );

  // ========== CART ACTIONS ==========
  const handleRemoveItem = async (productId) => {
    showModal({
      title: "Remove Item",
      message: "Are you sure you want to remove this item?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await cartService.removeFromCart(productId);
          onCartUpdate && onCartUpdate();
        } catch (error) {
          console.error("Error removing item:", error);
          showModal({
            title: "Error",
            message: "Failed to remove item.",
            type: "error",
          });
        }
      },
    });
  };

  const handleUpdateQuantity = async (productId, currentQuantity, type) => {
    let newQuantity =
      type === "increment" ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity < 1) return handleRemoveItem(productId);

    try {
      await cartService.updateCartItem(productId, newQuantity);
      onCartUpdate && onCartUpdate();
    } catch (error) {
      console.error("Error updating quantity:", error);
      showModal({
        title: "Error",
        message: "Failed to update quantity.",
        type: "error",
      });
    }
  };

  // ===== COUPON =====
  const handleApplyCoupon = async (code) => {
    if (!code)
      return showModal({
        title: "Invalid Coupon",
        message: "Enter coupon code first.",
        type: "warning",
      });

    try {
      const data = await cartService.applyCoupon(code);

      setAppliedCouponData({
        discountAmount: data.discountAmount,
        cartTotal: data.cartTotal,
      });

      onCartUpdate && onCartUpdate();
      setCouponCode("");

      showModal({
        title: "Success",
        message: data.message || `Coupon "${code}" applied.`,
        type: "success",
      });
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to apply coupon.";

      showModal({
        title: "Error",
        message: errMsg,
        type: "error",
      });
    }
  };

  // ============== ORDER CREATION COMMON FUNCTION ==============
  const buildOrderPayload = () => {
    const orderItems = cartItems.flatMap((group) =>
      group.products.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        unitPrice: item.price,
      }))
    );

    return {
      buyerId: user.id,
      addressId: selectedAddressId,
      items: orderItems,
      totalPrice: parseFloat(currentTotalUSD.toFixed(2)),
      couponCodeApplied: appliedCouponData ? cart.couponCode : null,
      shippingCost: SHIPPING_TOTAL_USD,
      discountAmount: parseFloat(currentDiscountUSD.toFixed(2)),
      paymentMethod,
    };
  };

  // ========== COD PAYMENT ==========
  const handleCOD = async () => {
    if (!validateBeforePay()) return;

    setIsProcessing(true);

    try {
      const payload = {
        ...buildOrderPayload(),
        paymentStatus: "UNPAID",
        orderStatus: "PENDING",
      };

      const res = await orderService.createOrder(payload);
      await cartService.clearCart();

      showModal({
        title: "Order Created",
        message: "Your COD order has been created successfully!",
        type: "success",
        onConfirm: () => {
          router.push(`/order/${res.order?._id}`);
        },
      });
    } catch (err) {
      showModal({
        title: "Order Failed",
        message: "Could not create COD order.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== PAYPAL (FAKE) ==========
  const handleFakePayPalSuccess = async () => {
    setPayPalModalOpen(false);

    setIsProcessing(true);
    try {
      const payload = {
        ...buildOrderPayload(),
        paymentMethod: "PAYPAL",
        paymentStatus: "PAID",
        orderStatus: "PENDING",
      };

      const res = await orderService.createOrder(payload);
      await cartService.clearCart();

      showModal({
        title: "Payment Successful",
        message: "Your PayPal payment was successful and order created!",
        type: "success",
        onConfirm: () => {
          router.push(`/order/${res.order?._id}`);
        },
      });
    } catch (err) {
      showModal({
        title: "Payment Error",
        message: "Could not finalize PayPal payment.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFakePayPalFail = () => {
    setPayPalModalOpen(false);
    showModal({
      title: "Payment Failed",
      message: "Demo: PayPal payment did NOT complete.",
      type: "error",
    });
  };

  // ========== MAIN PAYMENT LOGIC ==========
  const validateBeforePay = () => {
    if (!isAddressSelected) {
      showModal({
        title: "Address Required",
        message: "Please select a shipping address.",
        type: "warning",
      });
      return false;
    }

    if (cartItems.length === 0) {
      showModal({
        title: "Empty Cart",
        message: "Your cart is empty.",
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const handlePayment = () => {
    if (!validateBeforePay()) return;

    if (paymentMethod === "COD") {
      return handleCOD();
    }

    if (paymentMethod === "PAYPAL") {
      return setPayPalModalOpen(true);
    }

    showModal({
      title: "Not Supported",
      message: "This payment method is UI only.",
      type: "warning",
    });
  };

  // =============================================================
  // ======================= UI RENDER ============================
  // =============================================================

  return (
    <>
      {/* MODALS */}
      <AlertModal
        open={isOpen}
        onClose={() => {
          if (modalContent.type !== "confirm" && modalContent.onConfirm) {
            modalContent.onConfirm();
          }
          hideModal();
        }}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
        onConfirm={handleConfirm}
      />

      <FakePayPalModal
        open={isPayPalModalOpen}
        onClose={() => setPayPalModalOpen(false)}
        onSuccess={handleFakePayPalSuccess}
        onFail={handleFakePayPalFail}
      />

      {/* PAGE LAYOUT */}
      <div className="bg-white min-h-screen text-[#111820] flex flex-col items-center">
        <div className="flex justify-between items-center w-[90%] max-w-[1200px] py-6 border-b border-gray-200">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/home")}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"
              className="h-8"
            />
            <h1 className="text-2xl font-semibold">Checkout</h1>
          </div>
        </div>

        <div className="flex justify-between w-[90%] max-w-[1200px] mt-10 gap-10">
          {/* LEFT SIDE ========================================= */}
          <div className="flex flex-col w-[68%] space-y-12">
            {/* PAYMENT METHODS */}
            <section>
              <h2 className="text-[20px] font-semibold mb-5">Pay with</h2>
              <div className="space-y-4">
                {[
                  {
                    label: "PayPal (Demo)",
                    value: "PAYPAL",
                    icon: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
                  },
                  {
                    label: "Cash on Delivery (COD)",
                    value: "COD",
                    icon: "https://cdn-icons-png.flaticon.com/512/1040/1040227.png",
                  },
                ].map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="w-5 h-5 accent-[#3665f3]"
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                    />
                    <img src={m.icon} className="h-5" />
                    <span className="text-[15px] font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* SHIPPING ADDRESS */}
            <ShipTo
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              onAddressChange={fetchAddresses}
            />

            {/* REVIEW ITEMS */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-[20px] font-semibold mb-6">Review order</h2>

              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cartItems.map((group) => (
                  <div key={group.seller._id} className="border-b pb-6 mb-6">
                    <div className="flex items-center gap-2 text-[14px] text-gray-600 mb-1">
                      <span className="font-semibold">
                        Seller: {group.seller.username}
                      </span>
                    </div>

                    {group.products.map((item) => (
                      <div key={item._id} className="flex gap-4 pt-4">
                        <img
                          src={item.images?.[0]}
                          className="w-24 h-24 object-cover border rounded-md"
                        />
                        <div>
                          <p className="font-semibold text-[15px] mt-2">
                            {item.description}
                          </p>
                          <p className="text-[15px] font-medium mt-1">
                            US ${item.price.toFixed(2)}
                          </p>

                          <div className="flex items-center gap-3 mt-3">
                            <label className="text-[14px]">Quantity</label>
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity,
                                    "decrement"
                                  )
                                }
                                className="px-2 py-1"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>

                              <span className="px-3 py-1 border-l border-r">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity,
                                    "increment"
                                  )
                                }
                                className="px-2 py-1"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-[#3665f3] text-[13px]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </section>

            {/* COUPONS */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-[20px] font-semibold mb-5">Coupons</h2>
              <p className="text-[14px] mb-4">
                Apply coupons or add eBay gift cards to your account. Once
                added, gift cards can't be removed.
              </p>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="border border-gray-300 rounded-md px-3 py-2 w-[220px] focus:ring-2 focus:ring-[#3665f3] outline-none text-[14px]"
                />
                <button
                  onClick={() => handleApplyCoupon(couponCode)}
                  className="px-5 py-2 bg-gray-100 border border-gray-300 rounded-full text-[14px] font-medium hover:bg-gray-200"
                >
                  Apply
                </button>
              </div>

              <div className="text-[14px] w-100 space-y-3 mb-[50px]">
                <span className="font-bold text-[18px]">Coupons:</span>
                {Array.isArray(coupons) ? (
                  <>
                    {coupons.map((coupon) => (
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        key={coupon._id}
                      >
                        <span>{coupon.code ? coupon.code : ""}</span>
                        <span className="ml-auto text-gray-500 text-sm">
                          Available discount: {coupon.discountPercent}%
                        </span>
                      </label>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY ========================= */}
          <div className="w-[30%]">
            <div className="sticky top-10 bg-[#f9f9f9] border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[20px] font-semibold mb-5">Order Summary</h3>

              <div className="space-y-2 text-[15px]">
                <div className="flex justify-between">
                  <span>Items ({totalItemsCount})</span>
                  <span>US ${currentSubtotalUSD.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>US ${shippingUSD.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    {currentDiscountUSD > 0
                      ? `-US ${currentDiscountUSD.toFixed(2)}`
                      : "-"}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between font-semibold text-[17px]">
                  <span>Total</span>
                  <span>US ${currentTotalUSD.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full mt-6 py-3 font-semibold rounded-full bg-[#3665f3] text-white hover:bg-[#2953c6]"
              >
                {isProcessing ? "Processing..." : "Confirm and Pay"}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                {isAddressSelected
                  ? `Shipping to: ${selectedAddress?.fullname}`
                  : "Please select a shipping address"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
