"use client";

import { useState, useEffect } from "react";
import bidService from "@/services/bidService";
import { getUserFromStorage } from "@/lib/utils";
import AlertModal from "@/components/shared/AlertModal";

// Ẩn tên nếu muốn thêm layer nữa (optional),
// nhưng backend đã mask rồi, có thể bỏ.
function maskName(name) {
  if (!name) return "";
  if (name.length <= 2) return name + "***";
  return name[0] + "***" + name[name.length - 1];
}

export default function AuctionPage({ productId }) {
  const [product, setProduct] = useState(null); // product info từ backend
  const [bids, setBids] = useState([]); // bidHistory
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("info"); // success | error | warning | confirm
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [autoBid, setAutoBid] = useState("");
  const [savingAuto, setSavingAuto] = useState(false);

  const showModal = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleSetAutoBid = async () => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      return showModal(
        "error",
        "Login required",
        "Please login to set auto-bid"
      );
    }

    const buyerId = user.id || user._id;
    const maxAutoBid = Number(autoBid);

    if (!maxAutoBid || maxAutoBid <= 0) {
      return showModal(
        "warning",
        "Invalid",
        "Please enter a valid auto-bid amount."
      );
    }

    try {
      setSavingAuto(true);

      await bidService.updateAutoBid(product.id, buyerId, maxAutoBid);

      showModal(
        "success",
        "Auto-bid updated",
        "Your maximum auto-bid has been updated!"
      );

      await fetchBidData(); // reload dữ liệu
    } catch (err) {
      showModal("error", "Update failed", err.response?.data?.message);
    } finally {
      setSavingAuto(false);
    }
  };

  // ===== Load dữ liệu đấu giá theo productId =====
  const fetchBidData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bidService.getBidHistoryByProduct(productId);
      if (!data.success) {
        setError(data.message || "Không lấy được dữ liệu đấu giá.");
        return;
      }
      setProduct(data.product);
      setBids(data.bidHistory || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu đấu giá."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== Load dữ liệu đấu giá theo productId =====
  useEffect(() => {
    if (productId) {
      fetchBidData();
    }
  }, [productId]);

  // ===== Load AutoBid của user =====
  useEffect(() => {
    const loadAutoBid = async () => {
      const user = getUserFromStorage(localStorage, sessionStorage);
      if (!user) return;

      const userId = user.id || user._id;

      try {
        const data = await bidService.getUserAutoBid(productId, userId);
        if (data.success && data.autoBid) {
          setAutoBid(data.autoBid); // fill vào input FE
        }
      } catch (err) {
        console.error("Error loading autoBid:", err);
      }
    };

    if (productId) {
      loadAutoBid();
    }
  }, [productId]);

  // ===== Countdown theo auctionEndTime =====
  useEffect(() => {
    if (!product?.auctionEndTime) return;

    const endTime = new Date(product.auctionEndTime).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Auction ended");
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h} hrs ${m} mins ${s} secs`);
    }, 1000);

    return () => clearInterval(timer);
  }, [product?.auctionEndTime]);

  // ===== Handler đặt bid =====
  const handlePlaceBid = async () => {
    const user = getUserFromStorage(localStorage, sessionStorage);
    if (!user) {
      showModal("error", "Login required", "Please login to place a bid.");

      return;
    }

    const buyerId = user.id || user._id;
    const amount = Number(bidAmount);

    if (!amount || amount <= 0) {
      showModal("warning", "Invalid bid", "Please enter a valid bid amount.");

      return;
    }

    try {
      setPlacing(true);
      await bidService.placeBid(product.id, amount, buyerId);
      setBidAmount("");

      await fetchBidData(); // load lại lịch sử
    } catch (err) {
      showModal(
        "error",
        "Bid failed",
        err.response?.data?.message ||
          "An error occurred while placing your bid."
      );
    } finally {
      setPlacing(false);
    }
  };

  const startPrice = product?.startingPrice;

  const highestBid = product?.price || (bids.length ? bids[0].bidAmount : 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 text-lg">
        Đang tải dữ liệu đấu giá...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 text-lg text-red-600">
        {error || "Không tìm thấy dữ liệu đấu giá cho sản phẩm này."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-sans text-[17px]">
      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-6">Bid History</h1>

      {/* PRODUCT CARD */}
      <div className="border p-6 rounded-xl bg-white shadow-lg">
        <div className="flex gap-8">
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-40 h-40 object-contain rounded-lg border"
            />
          )}

          <div className="flex-1">
            <h2 className="font-semibold text-2xl mb-2">{product.title}</h2>

            <p className="text-gray-700 text-lg">
              <strong>Starting bid:</strong>{" "}
              <span className="text-2xl font-bold text-gray-900">
                ${startPrice.toLocaleString()}
              </span>
            </p>

            <p className="text-gray-700 text-lg">
              <strong>Current bid:</strong>{" "}
              <span className="text-2xl font-bold text-gray-900">
                ${highestBid.toLocaleString()}
              </span>
            </p>

            <p className="text-gray-700 mt-2 text-lg">
              <strong>Shipping:</strong> {product.shipping}
            </p>

            <p className="text-gray-700 mt-2 text-lg">
              <strong>Number of bids:</strong> {product.totalBids}
            </p>

            <p className="text-gray-700 mt-2 text-lg">
              <strong>Time left:</strong>{" "}
              <span className="text-red-600 font-semibold">{timeLeft}</span>
            </p>
          </div>
        </div>

        {/* INPUT BID */}
        <div className="mt-6 flex gap-4">
          <input
            type="number"
            className="border rounded-lg px-4 py-3 w-72 text-lg"
            placeholder={`Enter $${
              highestBid + (product.minIncrement || 1)
            } or more`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button
            onClick={handlePlaceBid}
            disabled={placing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {placing ? "Placing..." : "Place bid"}
          </button>
          <div className="mt-4 flex gap-4">
            <input
              type="number"
              placeholder="Enter max auto-bid"
              className="border rounded-lg px-4 py-3 w-72 text-lg"
              value={autoBid}
              onChange={(e) => setAutoBid(e.target.value)}
            />

            <button
              onClick={handleSetAutoBid}
              disabled={savingAuto}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            >
              {savingAuto ? "Saving..." : "Set Auto Bid"}
            </button>
          </div>
        </div>
      </div>

      {/* BID TABLE */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Bid history</h2>

        <div className="border rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left text-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Bidder</th>
                <th className="p-4">Bid Amount</th>
                <th className="p-4">Bid Time</th>
              </tr>
            </thead>

            <tbody>
              {bids.map((b) => (
                <tr key={b.bidId} className="border-b hover:bg-gray-50">
                  {/* backend đã mask rồi => b.bidderName */}
                  <td className="p-4 font-medium">{b.bidderName}</td>
                  <td className="p-4 font-semibold text-gray-900">
                    ${b.bidAmount.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-700">
                    {new Date(b.bidTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bids.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-lg">
              No bids placed yet.
            </div>
          )}
        </div>
      </div>
      <AlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}
