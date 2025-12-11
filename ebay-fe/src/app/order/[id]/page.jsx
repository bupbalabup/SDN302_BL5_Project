// page.jsx

"use client";
import Loading from "@/components/shared/Loading";
import Modal from "@/components/shared/Modal";
import { USD_TO_VND_RATE } from "@/lib/constants";
import orderService from "@/services/orderService";
import reviewService from "@/services/reviewService"; // <-- Thêm import
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const StarRating = ({ rating, setRating, maxStars = 5 }) => (
  <div className="flex items-center space-x-1">
    {[...Array(maxStars)].map((_, index) => {
      const starValue = index + 1;
      return (
        <svg
          key={index}
          onClick={() => setRating(starValue)}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            starValue <= rating
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.695h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.05a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.05a1 1 0 00-1.175 0l-2.817 2.05c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.817-2.05c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.695l1.07-3.292z" />
        </svg>
      );
    })}
  </div>
);

export default function OrderDetail() {
  const router = useRouter()
  const params = useParams();
  const { id } = params;

  const [orderData, setOrderData] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [selectedReviewItemId, setSelectedReviewItemId] = useState(null);
  // Thêm state để lưu productId cho review
  const [selectedReviewProductId, setSelectedReviewProductId] = useState(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [selectedFeedbackSellerId, setSelectedFeedbackSellerId] =
    useState(null);
  const [selectedFeedbackSellerName, setSelectedFeedbackSellerName] =
    useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetails(id);

      if (response.success) {
        setOrderData(response.order);
        setShippingInfo(response.shippingInfo);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const canRequestReturn = (order) => {
    if (!order || order.status !== "Delivered") {
      return false;
    }
    const deliveryDate = order.shippingInfo?.deliveredDate
      ? new Date(order.shippingInfo.deliveredDate)
      : null;

    if (!deliveryDate) {
      return false;
    }

    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = Date.now() - sevenDaysInMs;

    return deliveryDate.getTime() > sevenDaysAgo;
  };

  const handleOpenReturnModal = () => {
    setReturnReason("");
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    setReturnReason("");
  };

  const handleSubmitReturn = () => {
    if (!returnReason.trim()) {
      alert("Please provide a reason for the return.");
      return;
    }

    console.log(`Submitting return request for Order ID: ${orderData._id}`);
    console.log(`Reason: ${returnReason}`);

    // TODO: Implement actual API call for return request
    handleCloseReturnModal();
  };

  const handleOpenReviewModal = (itemId, productId) => {
    setSelectedReviewItemId(itemId);
    setSelectedReviewProductId(productId); // <-- Lưu productId
    setReviewRating(0);
    setReviewContent("");
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedReviewItemId(null);
    setSelectedReviewProductId(null); // <-- Xóa productId
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewContent.trim()) {
      alert("Please provide a rating and review content.");
      return;
    }

    if (!selectedReviewProductId) {
      alert("Product ID is missing for the review.");
      return;
    }

    try {
      console.log(
        `Submitting review for Product ID: ${selectedReviewProductId}`
      );

      const reviewData = {
        productId: selectedReviewProductId,
        rating: reviewRating,
        comment: reviewContent,
        // Có thể cần thêm orderItemId nếu backend yêu cầu
      };

      await reviewService.createReview(reviewData);

      alert("Review submitted successfully!");
      fetchOrder(); // Tải lại dữ liệu đơn hàng để cập nhật trạng thái
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(`Failed to submit review. ${error.message || "Please try again."}`);
    } finally {
      handleCloseReviewModal();
    }
  };

  const handleOpenFeedbackModal = (sellerId, sellerName) => {
    setSelectedFeedbackSellerId(sellerId);
    setSelectedFeedbackSellerName(sellerName);
    setFeedbackRating(0);
    setFeedbackContent("");
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedbackSellerId(null);
    setSelectedFeedbackSellerName("");
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0 || !feedbackContent.trim()) {
      alert("Please provide a rating and feedback content.");
      return;
    }

    if (!selectedFeedbackSellerId) {
      alert("Seller ID is missing for the feedback.");
      return;
    }

    try {
      console.log(
        `Submitting feedback for Seller ID: ${selectedFeedbackSellerId}`
      );

      const feedbackData = {
        sellerId: selectedFeedbackSellerId,
        rating: feedbackRating,
        comment: feedbackContent,
      };

      await reviewService.createFeedback(feedbackData);

      alert("Feedback submitted successfully!");
      fetchOrder();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert(
        `Failed to submit feedback. ${error.message || "Please try again."}`
      );
    } finally {
      handleCloseFeedbackModal();
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !orderData) {
    return (
      <div className="max-w-[1488px] mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">
              {error || "Order not found"}
            </p>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:underline"
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatStatus = (status) => {
    return status.replace(/_/g, " ");
  };

  const REVIEW_FEEDBACK_ELIGIBLE_STATUSES = [
    "Delivered",
    "RequestReturned",
    "Returned",
  ];

  const firstProductTitle = orderData.items[0]?.productId?.title || "Order";

  return (
    <div className="max-w-[1488px] mx-auto px-4">
      <div className="bg-white min-h-screen font-[Market Sans,Helvetica Neue,Helvetica,Arial,Roboto,sans-serif] py-10">
        <h1 className="text-3xl font-semibold mb-2 text-gray-900">
          Order details
          {firstProductTitle.length > 50 ? "..." : ""}
        </h1>
        <p className="text-gray-500 text-sm mb-8">Order ID: {orderData._id}</p>

        {canRequestReturn(orderData) && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex justify-between items-center">
            <p className="text-yellow-800 font-medium">
              This order is eligible for return within 7 days of delivery.
            </p>
            <button
              onClick={handleOpenReturnModal}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Request a Return
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {orderData.items.map((item, index) => {
              const product = item.productId;
              const imageUrl =
                product?.images?.[0] ||
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500";

              const isReviewFeedbackEligible =
                REVIEW_FEEDBACK_ELIGIBLE_STATUSES.includes(orderData.status);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
                  // XÓA onClick: onClick={() => router.push(`/order/${order._id}`)}
                >
                  <div className="flex gap-6">
                    <img
                      src={imageUrl}
                      alt={product?.title || "Product"}
                      className="w-40 h-40 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500";
                      }}
                    />

                    <div className="flex-1">
                      <p className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit mb-3 font-medium">
                        {formatStatus(orderData.status)}
                      </p>

                      <h2
                        className="text-xl font-semibold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer mb-3"
                        onClick={() => router.push(`/products/${product._id}`)} // <-- ĐÃ THÊM: Điều hướng đến trang chi tiết sản phẩm
                      >
                        {product?.title || "Product title unavailable"}
                      </h2>

                      {product?.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {product?.sellerId && (
                        <div className="mt-2">
                          <p className="text-gray-600 text-sm">
                            Sold by{" "}
                            <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                              {product.sellerId.fullname}
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs">
                            {product.sellerId.email}
                          </p>
                        </div>
                      )}

                      <p className="text-gray-500 text-sm mt-2">
                        Quantity:{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg text-gray-900">
                          US ${item.unitPrice.toFixed(2)}
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            per item
                          </span>
                        </p>
                        <p className="text-gray-500 text-sm">
                          ({(item.unitPrice * USD_TO_VND_RATE).toLocaleString()}{" "}
                          VND)
                        </p>

                        {item.quantity > 1 && (
                          <p className="text-gray-700 text-sm mt-2 font-medium">
                            Subtotal: US $
                            {(item.unitPrice * item.quantity).toFixed(2)}
                            <span className="text-gray-500 text-xs ml-1">
                              (
                              {(
                                item.unitPrice *
                                item.quantity *
                                USD_TO_VND_RATE
                              ).toLocaleString()}{" "}
                              VND)
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HIỂN THỊ NÚT ĐÁNH GIÁ VÀ PHẢN HỒI CHỈ KHI TRẠNG THÁI 
                      LÀ 'Delivered', 'RequestReturned', HOẶC 'Returned'
                  */}
                  {isReviewFeedbackEligible && (
                    <div className="flex gap-4 text-sm mt-6 justify-end border-t pt-4">
                      <button
                        className="text-blue-600 hover:underline font-medium"
                        onClick={
                          () => handleOpenReviewModal(item._id, product._id) // <-- Truyền productId
                        }
                      >
                        Write a review
                      </button>
                      {product?.sellerId && (
                        <button
                          className="text-gray-600 hover:underline font-medium"
                          onClick={() =>
                            handleOpenFeedbackModal(
                              product.sellerId._id,
                              product.sellerId.fullname
                            )
                          }
                        >
                          Give feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {shippingInfo && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                  Shipping details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                      Carrier:
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {shippingInfo.carrier}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                      Tracking number:
                    </span>
                    <span className="text-sm text-blue-600 font-mono hover:underline cursor-pointer">
                      {shippingInfo.trackingNumber}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                      Status:
                    </span>
                    <span className="text-sm text-gray-900">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        {formatStatus(shippingInfo.status)}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                      Estimate Arrival:
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(
                        shippingInfo.estimateArrival
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {shippingInfo.deliveredDate && (
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                        Delivered Date:
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {new Date(
                          shippingInfo.deliveredDate
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order summary
              </h3>

              <div className="space-y-2 mb-4">
                {orderData.items.map((item, index) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productId?.title?.substring(0, 25)}
                      {item.productId?.title?.length > 25 ? "..." : ""} (x
                      {item.quantity})
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    US ${orderData.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-900 font-bold text-xl mt-4 pt-4 border-t-2">
                <span>Total:</span>
                <span>US ${orderData.totalPrice.toFixed(2)}</span>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                ({(orderData.totalPrice * USD_TO_VND_RATE).toLocaleString()}{" "}
                VND)
              </p>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(orderData.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Order ID:</span>{" "}
                  <span className="font-mono">{orderData._id}</span>
                </p>
              </div>
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Delivery address
              </h3>

              <div className="space-y-1">
                <p className="text-gray-900 font-semibold text-base">
                  {orderData.addressId.fullname}
                </p>
                {orderData.addressId.street && (
                  <p className="text-gray-700 text-sm">
                    {orderData.addressId.street}
                  </p>
                )}
                <p className="text-gray-700 text-sm">
                  {orderData.addressId.city}
                  {orderData.addressId.state &&
                    `, ${orderData.addressId.state}`}
                </p>
                <p className="text-gray-700 text-sm">
                  {orderData.addressId.country}
                </p>
                <p className="text-gray-700 text-sm mt-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {orderData.addressId.phone}
                </p>
              </div>
            </div>

            {/* BUYER INFO */}
            <div className="bg-white shadow-sm p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Buyer information
              </h3>

              <div className="space-y-1">
                <p className="text-gray-900 font-semibold text-base">
                  {orderData.buyerId.fullname}
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {orderData.buyerId.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
          MODAL 1: RETURN REASON
      ============================ */}
      <Modal
        open={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        title="Request a Return"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please briefly explain why you wish to return this order (Order ID:{" "}
            {orderData?._id}):
          </p>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Enter reason here..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          ></textarea>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseReturnModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReturn}
              disabled={!returnReason.trim()} // Vô hiệu hóa nút nếu lý do trống
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                returnReason.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 cursor-not-allowed"
              }`}
            >
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        title="Write a Product Review"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-medium">
            Your rating for Item ID: {selectedReviewItemId} (Product ID:{" "}
            {selectedReviewProductId})
          </p>
          <div className="flex flex-col gap-3">
            <StarRating rating={reviewRating} setRating={setReviewRating} />

            <p className="text-gray-600 pt-2">Your review:</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
              placeholder="Enter your review here..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseReviewModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || !reviewContent.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                reviewRating === 0 || !reviewContent.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
        title="Give Seller Feedback"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-medium">
            Your rating for **{selectedFeedbackSellerName}** (Seller ID:{" "}
            {selectedFeedbackSellerId})
          </p>
          <div className="flex flex-col gap-3">
            <StarRating rating={feedbackRating} setRating={setFeedbackRating} />

            <p className="text-gray-600 pt-2">Your feedback:</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
              placeholder="Enter your feedback here..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseFeedbackModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFeedback}
              disabled={feedbackRating === 0 || !feedbackContent.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                feedbackRating === 0 || !feedbackContent.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}