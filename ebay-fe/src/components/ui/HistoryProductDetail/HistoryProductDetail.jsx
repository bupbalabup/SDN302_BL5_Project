"use client";
import React from "react";

export default function HistoryProductDetail() {
  // ==========================
  // FAKE DATA FOR TESTING UI
  // ==========================
  const order = {
    id: "ORD-2025-001",
    buyerName: "Dinh Duy Anh",
    orderDate: "2025-11-13T09:43:04.386Z",
    totalPriceUSD: 93.6,
    totalPriceVND: 2321480,
    address: {
      fullName: "Dinh Duy Anh",
      phone: "0984432509",
      addressLine: "123 Đống Đa",
      city: "Hà Nội",
      country: "Vietnam",
      postalCode: "000084",
    },
    items: [
      {
        id: "ITEM-001",
        name: "UMIDIGI A11 Pro Max 6.8'' Unlocked Smartphone Android",
        seller: "UMIDIGI US Official Store",
        feedback: "96.1% positive feedback",
        image:
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
        priceUSD: 115.19,
        priceVND: 3029497,
        shippingUSD: 81.17,
        shippingVND: 2134771,
        status: "Processing",
      },
    ],
  };

  const shippingInfo = {
    carrier: "FastExpress",
    trackingNumber: "TRACK-1763026984388",
    status: "Pending Pickup",
    estimateArrival: "2025-11-18T09:43:04.388Z",
  };

  const item = order.items[0]; // single product detail page

  // ==========================
  // RENDER PAGE
  // ==========================
  return (
    <div className="bg-white min-h-screen font-[Market Sans,Helvetica Neue,Helvetica,Arial,Roboto,sans-serif] px-10 py-10">
      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">
        Order details – {item.name.substring(0, 45)}...
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ==========================
            LEFT SIDE — PRODUCT SECTION
        ===========================*/}
        <div className="lg:col-span-2 space-y-8">
          {/* PRODUCT CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex gap-6">
              <img
                src={item.image}
                alt={item.name}
                className="w-40 h-40 object-cover rounded-xl"
              />

              <div className="flex-1">
                <p className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit mb-2">
                  {item.status}
                </p>

                <h2 className="text-xl font-semibold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer">
                  {item.name}
                </h2>

                <p className="text-gray-600 text-sm mt-2">
                  Sold by{" "}
                  <span className="text-blue-600 hover:underline">
                    {item.seller}
                  </span>
                </p>
                <p className="text-gray-500 text-sm">{item.feedback}</p>
              </div>
            </div>

            {/* PRICE BLOCK */}
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold text-lg text-gray-900">
                US ${item.priceUSD.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">
                ({item.priceVND.toLocaleString()} VND)
              </p>

              <p className="text-gray-500 text-sm mt-1">
                + US ${item.shippingUSD.toFixed(2)} Shipping (
                {item.shippingVND.toLocaleString()} VND)
              </p>
              <p className="text-gray-400 text-xs mt-1">Returns accepted</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-8 text-sm text-blue-600 mt-4 justify-end">
              <button className="hover:underline">Request a return</button>
              <button className="hover:underline">Buy it again</button>
              <button className="hover:underline">Remove</button>
            </div>
          </div>

          {/* SHIPPING TIMELINE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Shipping details
            </h3>

            <p className="text-sm text-gray-700">
              <strong>Carrier:</strong> {shippingInfo.carrier}
            </p>

            <p className="text-sm mt-1 text-gray-700">
              <strong>Tracking number:</strong>{" "}
              <span className="text-blue-600">
                {shippingInfo.trackingNumber}
              </span>
            </p>

            <p className="text-sm mt-1 text-gray-700">
              <strong>Status:</strong> {shippingInfo.status}
            </p>

            <p className="text-sm mt-1 text-gray-700">
              <strong>Estimate Arrival:</strong>{" "}
              {new Date(shippingInfo.estimateArrival).toDateString()}
            </p>
          </div>
        </div>

        {/* ==========================
            RIGHT SIDE — ORDER SUMMARY
        =========================== */}
        <div className="space-y-8">
          {/* ORDER SUMMARY */}
          <div className="bg-white shadow-sm p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order summary
            </h3>

            <div className="flex justify-between text-gray-700">
              <span>Item price:</span>
              <span>US ${item.priceUSD.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700 mt-1">
              <span>Shipping:</span>
              <span>US ${item.shippingUSD.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-900 font-bold text-lg mt-4 pt-3 border-t">
              <span>Total:</span>
              <span>US ${order.totalPriceUSD.toFixed(2)}</span>
            </div>

            <p className="text-gray-500 text-sm mt-1">
              ({order.totalPriceVND.toLocaleString()} VND)
            </p>
          </div>

          {/* SHIPPING ADDRESS */}
          <div className="bg-white shadow-sm p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Delivery address
            </h3>

            <p className="text-gray-800 font-medium">
              {order.address.fullName}
            </p>
            <p className="text-gray-700 text-sm">{order.address.addressLine}</p>
            <p className="text-gray-700 text-sm">
              {order.address.city}, {order.address.country}{" "}
              {order.address.postalCode}
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Phone: {order.address.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
