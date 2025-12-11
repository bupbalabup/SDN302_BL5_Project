import Product from "../models/Product.js";
import Bid from "../models/Bid.js";

// Hàm ẩn danh tên người dùng
const maskUsername = (username) => {
  if (!username || username.length < 2) return "A****";

  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const maskedPart = "*".repeat(Math.max(4, username.length - 2));

  return `${firstChar}${maskedPart}${lastChar}`;
};

export const placeBid = async (req, res) => {
  try {
    const { productId } = req.params;
    const { buyerId, bidAmount, maxAutoBid } = req.body;

    if (!buyerId) {
      return res
        .status(400)
        .json({ message: "You must log in to place a bid." });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isAuction)
      return res.status(400).json({ message: "Products not up for auction" });

    if (new Date() > product.auctionEndTime)
      return res.status(400).json({ message: "The auction has ended" });

    if (bidAmount <= product.price + product.minIncrement)
      return res.status(400).json({
        message: "Price must be higher than current price + minimum price step",
      });

    // Tạo bid
    const newBid = await Bid.create({
      productId,
      buyerId,
      bidAmount,
      maxAutoBid: maxAutoBid || bidAmount,
    });

    // prevHighestBidder = Bid cuối cùng của người đang giữ giá
    const prevHighestBidder = product.highestBidder
      ? await Bid.findOne({ productId, buyerId: product.highestBidder }).sort({
          createdAt: -1,
        })
      : null;

    // AUTO-BID LOGIC
    if (
      prevHighestBidder &&
      prevHighestBidder.maxAutoBid >= bidAmount + product.minIncrement
    ) {
      const autoBidAmount = bidAmount + product.minIncrement + 0.1;

      // tạo bid mới CHO NGƯỜI CŨ (người đang giữ giá)
      await Bid.create({
        productId,
        buyerId: product.highestBidder,
        bidAmount: autoBidAmount,
        maxAutoBid: prevHighestBidder.maxAutoBid,
      });

      // update product
      product.price = autoBidAmount;
      // highestBidder giữ nguyên
    } else {
      // người mới thắng
      product.highestBidder = buyerId;
      product.price = bidAmount;
    }

    await product.save();

    res.json({ message: "Đặt giá thành công", newBid, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// API lấy lịch sử đấu giá của sản phẩm
export const getBidHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (!product.isAuction) {
      return res
        .status(400)
        .json({ message: "Sản phẩm này không phải đấu giá" });
    }

    // Lấy danh sách bid, populate thông tin người đấu giá
    const bids = await Bid.find({ productId })
      .populate("buyerId", "username fullname email")
      .sort({ createdAt: -1 });

    const bidHistory = bids.map((bid) => {
      const buyerInfo = bid.buyerId;
      const displayName =
        buyerInfo?.username ||
        buyerInfo?.fullname ||
        buyerInfo?.email ||
        "Anonymous";

      return {
        bidId: bid._id,
        bidderName: maskUsername(displayName), // ĐÃ mask sẵn
        bidAmount: bid.bidAmount,
        bidTime: bid.createdAt,
      };
    });

    res.json({
      success: true,
      product: {
        id: product._id,
        title: product.title,
        image: product.images?.[0] || null,
        shipping: product.shipping || "FREE Expedited Shipping", // nếu không có field sẽ fallback text
        auctionEndTime: product.auctionEndTime,
        price: product.price,
        startingPrice: product.startingPrice,
        minIncrement: product.minIncrement,
        totalBids: bidHistory.length,
      },
      bidHistory,
    });
  } catch (error) {
    console.error("Error fetching bid history:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử đấu giá",
      error: error.message,
    });
  }
};

export const updateAutoBid = async (req, res) => {
  try {
    const { productId } = req.params;
    const { buyerId, maxAutoBid } = req.body;

    if (!buyerId) return res.status(400).json({ message: "You must login." });
    if (!maxAutoBid || maxAutoBid <= 0)
      return res.status(400).json({ message: "Invalid max auto bid value" });

    // Lấy bid mới nhất của user trên sản phẩm này
    const lastBid = await Bid.findOne({ productId, buyerId }).sort({
      createdAt: -1,
    });

    if (!lastBid) {
      return res.status(400).json({
        message: "You must place at least one bid before setting auto-bid",
      });
    }

    lastBid.maxAutoBid = maxAutoBid;
    await lastBid.save();

    return res.json({
      success: true,
      message: "Max auto bid updated successfully",
      bid: lastBid,
    });
  } catch (e) {
    console.error("AutoBid Update Error:", e);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

export const getUserAutoBid = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    // lấy bid mới nhất của user trên sản phẩm này
    const lastBid = await Bid.findOne({ productId, buyerId: userId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      autoBid: lastBid?.maxAutoBid || null,
    });
  } catch (error) {
    console.error("Error fetching user autoBid:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
