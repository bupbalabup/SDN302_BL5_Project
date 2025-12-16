"use client";
import Modal from "@/components/shared/Modal";
import { USD_TO_VND_RATE } from "@/lib/constants";
import { getUserFromStorage } from "@/lib/utils";
import orderService from "@/services/orderService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const PAYMENT_TIMEOUT_MINUTES = 10;
const PAYMENT_TIMEOUT_MS = PAYMENT_TIMEOUT_MINUTES * 60 * 1000;
const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Canceled",
  "RequestReturned",
  "Returned",
];

const formatNum = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
const getRemainingTime = (orderDate, now) => {
  if (!orderDate) return 0;
  const expireAt = new Date(orderDate).getTime() + PAYMENT_TIMEOUT_MS;
  return Math.max(expireAt - now, 0);
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
const canRequestReturn = (order) => {
  if (order.status !== "Delivered") {
    return false;
  }
  const deliveryDate = order.shippingInfo?.estimateArrival
    ? new Date(order.shippingInfo.estimateArrival)
    : null;

  if (!deliveryDate) {
    return false;
  }

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = Date.now() - sevenDaysInMs;

  return deliveryDate.getTime() > sevenDaysAgo;
};

export default function OrderHistory() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  /* ===== Tick mỗi giây để countdown ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // State cho Modal thông báo (thay thế alert)
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // State cho Modal yêu cầu trả hàng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // State MỚI cho Modal xác nhận hủy đơn hàng (thay thế window.confirm)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToCancelId, setOrderToCancelId] = useState(null);

  // Hàm hiển thị thông báo
  const showNotification = (title, message) => {
    setNotification({ isOpen: true, title, message });
  };

  const closeNotification = () => {
    setNotification({ isOpen: false, title: "", message: "" });
  };

  // Hàm đóng Modal xác nhận hủy
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setOrderToCancelId(null);
  };

  const filteredOrders =
    selectedStatus === "All"
      ? orders
      : orders.filter((p) => p.status === selectedStatus);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const user = getUserFromStorage(localStorage, sessionStorage);
      if (user) {
        const data = await orderService.getUserOrder();
        if (data.success) {
          setOrders(data.orders);
        } else {
          setOrders([]);
          showNotification(
            "Fetch Error",
            data.message || "Failed to load orders."
          );
        }
      } else {
        console.log("Không có user");
      }
    } catch (error) {
      console.error(error);
      setOrders([]);
      showNotification(
        "Fetch Error",
        "An error occurred while loading orders. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // Hàm mở Modal và lưu ID đơn hàng (Request Return)
  const handleRequestReturn = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
    setReturnReason("");
  };

  const handleSubmitReturn = async () => {
    if (!returnReason.trim()) {
      showNotification("Error", "Please provide a reason for the return.");
      return;
    }

    if (!selectedOrderId) {
      showNotification("Error", "No order selected for return.");
      return;
    }

    try {
      const data = await orderService.createReturnRequest(
        selectedOrderId,
        returnReason.trim()
      );

      handleCloseModal();

      if (data.success) {
        showNotification(
          "Success",
          "Return request submitted successfully. We will review your request shortly."
        );
        await fetchOrder();
      } else {
        showNotification(
          "Failure",
          data.message || "Failed to submit return request."
        );
      }
    } catch (error) {
      console.error("Error submitting return request:", error);
      handleCloseModal();
      showNotification(
        "Error",
        `An error occurred: ${error.message || "Please try again."}`
      );
    }
  };

  // HÀM CHỈ MỞ MODAL XÁC NHẬN HỦY ĐƠN HÀNG
  const handleCancelOrder = (orderId) => {
    setOrderToCancelId(orderId);
    setIsConfirmModalOpen(true);
  };

  // HÀM THỰC HIỆN HỦY ĐƠN HÀNG SAU KHI XÁC NHẬN
  const executeCancelOrder = async () => {
    if (!orderToCancelId) return;

    // Đóng modal xác nhận
    handleCloseConfirmModal();

    try {
      const data = await orderService.cancelOrder(orderToCancelId);

      if (data.success) {
        showNotification(
          "Success",
          `Order ${orderToCancelId} has been successfully canceled.`
        );
        await fetchOrder();
      } else {
        showNotification("Failure", data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      showNotification(
        "Error",
        `An error occurred while canceling the order: ${error.message || "Please try again."
        }`
      );
    } finally {
      setOrderToCancelId(null);
    }
  };

  const ordersToDisplay = filteredOrders;

  return (
    <div className="max-w-[1488px] mx-auto px-4">
      <div className="bg-white min-h-screen py-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          My eBay – Purchase History
        </h1>

        <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-10">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`
              whitespace-nowrap px-5 py-2 rounded-full text-sm border transition-all
              ${selectedStatus === status
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }
            `}
            >
              {status}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : ordersToDisplay.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-10">
            {ordersToDisplay.map((order) => {
              const remaining = getRemainingTime(order.orderDate, now);
              const totalUSD = order.totalPrice;
              const totalVND = totalUSD * USD_TO_VND_RATE;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full w-fit">
                        {order.status}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400">
                      Order ID: {order._id}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {order.items.map((item) => {
                      const product = item.productId || {};

                      return (
                        <div
                          key={item._id}
                          className="flex flex-col md:flex-row justify-between gap-6 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                          onClick={() => router.push(`/order/${order._id}`)}
                        >
                          <div className="flex gap-5">
                            <img
                              src={
                                product.images && product.images.length > 0
                                  ? product.images[0]
                                  : "placeholder-image-url"
                              }
                              alt={product.title}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-black">
                                {product.title || "Product Title Missing"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Variant Placeholder
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                Price per item: US ${item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-black text-lg">
                              US ${(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              (
                              {formatNum(
                                item.unitPrice * item.quantity * USD_TO_VND_RATE
                              )}{" "}
                              VND)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ORDER TOTAL & ACTION BUTTONS */}
                  <div className="mt-6 pt-4 border-t border-dashed flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-lg font-semibold text-gray-800">
                        Order Total:
                      </p>
                      <p className="font-bold text-black text-2xl">
                        US ${totalUSD.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        ({formatNum(totalVND)} VND)
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        + Shipping cost is included in total (Placeholder)
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-6 text-blue-600 text-sm">
                      {/* NÚT HỦY ĐƠN HÀNG KHI TRẠNG THÁI LÀ PROCESSING */}
                      {order.status === "Processing" && (
                        <button
                          className="hover:underline text-red-500"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancelled order
                        </button>
                      )}

                      {canRequestReturn(order) && (
                        <button
                          className="hover:underline"
                          onClick={() => handleRequestReturn(order._id)}
                        >
                          Request a return
                        </button>
                      )}
                      {/* ===== COUNTDOWN HERE ===== */}
                      {order.status === "Pending" && (
  <div className="mt-2 flex flex-col gap-2">
    {remaining > 0 ? (
      <>
        <p className="text-red-500 font-mono text-sm">
          Auto cancel in {formatCountdown(remaining)}
        </p>

        <button
          onClick={() => {
  sessionStorage.setItem("pendingOrderId", order._id);
  router.push("/checkout");
}}

          className="w-fit px-4 py-1.5 text-sm font-medium
                     text-white bg-blue-600 rounded-full
                     hover:bg-blue-700 transition"
        >
          Continue payment
        </button>
      </>
    ) : (
      <p className="text-red-500 text-sm">
        Payment time expired
      </p>
    )}
  </div>
)}
                      <button className="hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL YÊU CẦU TRẢ HÀNG */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Request a Return"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please briefly explain why you wish to return this item (Order ID:{" "}
            {selectedOrderId}):
          </p>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Enter reason here..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          ></textarea>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReturn}
              disabled={!returnReason.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${returnReason.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 cursor-not-allowed"
                }`}
            >
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL XÁC NHẬN HỦY ĐƠN HÀNG (THAY THẾ WINDOW.CONFIRM) */}
      <Modal
        open={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        title="Confirm Cancellation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel Order ID:{" "}
            <span className="font-semibold">{orderToCancelId}</span>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseConfirmModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={executeCancelOrder}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL THÔNG BÁO CHUNG (THAY THẾ ALERT) */}
      <Modal
        open={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        size="sm"
      >
        <div className="p-4 pt-0">
          <p className="text-gray-700">{notification.message}</p>
          <div className="flex justify-end pt-4">
            <button
              onClick={closeNotification}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
