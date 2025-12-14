"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "antd";
import {
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import cartService from "@/services/cartService";
import { useRouter } from "next/navigation";

const AddedToCartPopup = ({ visible, onClose, product, relatedItems }) => {
  const USD_TO_VND = 26300;
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const data = await cartService.getCart();
        const count = data.cart?.items?.length || 0;
        setCartCount(count);
      } catch (err) {
        console.error("Error fetching cart count:", err);
      }
    };
    if (visible) fetchCartCount();
  }, [visible]);

  if (!product) return null;

  const subtotalUSD = product.price + 3.6;
  const subtotalVND = (subtotalUSD * USD_TO_VND).toLocaleString("vi-VN");

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 220;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={1100}
      styles={{
        body: {
          padding: "0",
          borderRadius: "18px",
          fontFamily:
            "'Market Sans','Helvetica Neue','Helvetica','Arial','Roboto',sans-serif",
        },
      }}
      closeIcon={
        <span className="text-gray-500 hover:text-gray-800 text-3xl font-bold">
          ×
        </span>
      }
    >
      <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden">
        <div className="w-full md:w-1/2 p-10 border-r border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircleFilled className="text-green-500 text-3xl" />
            <h2 className="text-2xl font-bold text-gray-900">Added to cart</h2>
          </div>

          <div className="flex gap-5 mb-6">
            <img
              src={product.image || product.images?.[0] || "/placeholder.png"}
              alt={product.title}
              className="w-36 h-36 object-cover rounded-lg border border-gray-300"
            />
            <div className="flex flex-col justify-between">
              <p className="text-[17px] font-semibold text-gray-900 leading-tight">
                {product.title}
              </p>
              <p className="text-[15px] text-gray-700 mt-1">
                Item:{" "}
                <span className="font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </p>
              <div className="mt-2">
                <p className="text-[15px] font-bold text-gray-900">
                  Subtotal: ${subtotalUSD.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ({subtotalVND} VND)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => {
                onClose();
                router.push("/cart");
              }}
              className="w-full py-3.5 rounded-full font-semibold text-white text-lg bg-[#3665f3] hover:bg-[#2954d2] transition-all"
            >
              See in cart
            </button>
            <button
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
              className="w-full py-3.5 rounded-full font-semibold text-[#3665f3] border-2 border-[#3665f3] hover:bg-blue-50 text-lg"
            >
              Checkout {cartCount} {cartCount === 1 ? "item" : "items"}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-10 bg-white relative">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              Explore related items
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Sponsored</p>

          {relatedItems && relatedItems.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition"
              >
                <LeftOutlined className="text-gray-700 text-sm" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition"
              >
                <RightOutlined className="text-gray-700 text-sm" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar scroll-smooth"
              >
                {relatedItems.map((item) => {
                  const id = item._id || item.id;
                  const image =
                    item.image || item.images?.[0] || "/placeholder.png";

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          router.push(`/products/${id}`);
                        }, 200);
                      }}
                      className="min-w-[180px] max-w-[180px] flex-shrink-0 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={item.title}
                        className="w-full h-[150px] object-cover rounded-t-xl"
                      />
                      <div className="p-3">
                        <p className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-2 mb-1">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-gray-500">Pre-owned</p>
                        <p className="text-[15px] font-semibold text-gray-900 mt-1">
                          {(item.price * USD_TO_VND).toLocaleString("vi-VN")}{" "}
                          VND
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              No related items found for this category.
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Modal>
  );
};

export default AddedToCartPopup;
