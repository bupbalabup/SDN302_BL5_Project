"use client";
import React, { useState } from "react";

const FakePayPalModal = ({ open, onClose, onSuccess, onFail }) => {
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" />
          PayPal Demo Payment
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          This is a demo PayPal payment. You may enter any card information (no real card required).
        </p>

        {/* CARD FORM */}
        <div className="space-y-3">
          <input
            placeholder="Card Number"
            className="w-full border px-3 py-2 rounded-md text-sm"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
          />
          <input
            placeholder="Cardholder Name"
            className="w-full border px-3 py-2 rounded-md text-sm"
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              placeholder="MM/YY"
              className="w-full border px-3 py-2 rounded-md text-sm"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            />
            <input
              placeholder="CVV"
              className="w-full border px-3 py-2 rounded-md text-sm"
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 text-sm bg-gray-200 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md"
            onClick={onSuccess}
          >
            Demo Success Payment
          </button>

          <button
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md"
            onClick={onFail}
          >
            Demo Failed Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default FakePayPalModal;
