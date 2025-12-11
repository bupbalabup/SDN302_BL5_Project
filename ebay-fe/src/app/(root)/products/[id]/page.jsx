"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProductById,
  getProductsByCategory,
} from "@/services/productService";
import { toast } from "react-hot-toast";
import cartService from "@/services/cartService";
import AddedToCartPopup from "@/components/ui/AddToCartStatus/AddToCartStatus";
import { useRouter } from "next/navigation";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();
  // Countdown timer effect
  useEffect(() => {
    if (!product?.isAuction || !product?.auctionEndTime) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(product.auctionEndTime).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft("Auction ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await cartService.addToCart(product, quantity);
      toast.success("Added to cart successfully!");
      window.dispatchEvent(new Event("cart_updated"));

      if (product.categoryId) {
        try {
          const categoryId =
            typeof product.categoryId === "object"
              ? product.categoryId._id
              : product.categoryId;

          const response = await getProductsByCategory(categoryId);
          const related = response.products || response;
          const filteredRelated = related.filter((p) => p._id !== product._id);
          setRelatedItems(filteredRelated);
        } catch (err) {
          console.error("Error fetching related items:", err);
          setRelatedItems([]);
        }
      }

      setShowPopup(true);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        if (data?.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setSelectedImage(data.product.images?.[0] || data.product.image);
        } else {
          setProduct(data);
          setReviews(data.reviews || []);
          setSelectedImage(data.images?.[0] || data.image);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadProduct();
  }, [id]);

  const randomSold = Math.floor(Math.random() * 1000) + 1;
  const randomViewed = Math.floor(Math.random() * 500) + 50;

  if (loading)
    return (
      <div
        className="text-center mt-20 text-gray-600"
        style={{
          fontFamily: "'Market Sans', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );

  if (!product)
    return (
      <div
        className="text-center mt-20 text-red-500"
        style={{
          fontFamily: "'Market Sans', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        No product found
      </div>
    );

  return (
    <main
      className="bg-white min-h-screen"
      style={{
        fontFamily: "'Market Sans', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <AddedToCartPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        product={{
          title: product.title,
          price: product.price,
          image: selectedImage || product.image,
          shipping: 45.15,
        }}
        relatedItems={relatedItems}
      />

      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <span className="hover:underline cursor-pointer">
              Shop by category
            </span>
            <span className="mx-2">›</span>
            <span className="hover:underline cursor-pointer">
              {product.categoryId?.name || "Category"}
            </span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <div className="sticky top-4">
              <div className="mb-4 text-sm">
                <span className="text-gray-600">SAVE UP TO </span>
                <span className="text-red-600 font-bold">7%</span>
                <span className="text-gray-600"> WHEN YOU BUY MORE</span>
              </div>

              <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={
                    selectedImage ||
                    product.image ||
                    product.images?.[0] ||
                    "/placeholder.png"
                  }
                  alt={product.title}
                  className="w-full h-[500px] object-contain p-8"
                />

                <div className="absolute top-4 left-4">
                  <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                    {randomViewed} VIEWED IN THE LAST 24 HOURS
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>
                  <button className="bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-sm ml-1">3.3K</span>
                  </button>
                </div>

                <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-3 shadow">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-3 shadow">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer hover:border-blue-500 transition ${selectedImage === img
                        ? "border-blue-500"
                        : "border-gray-300"
                        }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-sm font-semibold">Share</span>
              </button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <h1 className="text-2xl font-normal text-gray-900 mb-4">
              {product.title}
            </h1>

            {product.sellerId && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <img
                  src={product.sellerId.avatarURL || "/user.png"}
                  alt={product.sellerId.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                      {product.sellerId.username}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ({Math.floor(Math.random() * 100000)})
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">
                      99.6% positive
                    </span>
                    <span className="mx-2 text-gray-400">·</span>
                    <a href="#" className="text-blue-600 hover:underline">
                      Seller's other items
                    </a>
                    <span className="mx-2 text-gray-400">·</span>
                    <a href="#" className="text-blue-600 hover:underline">
                      Contact seller
                    </a>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-600">US</span>
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price?.toLocaleString()}
                </span>
                <span className="text-gray-600">/ea</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Approximately {(product.price * 23000).toLocaleString()} VND
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  Was US ${(product.price * 1.05).toLocaleString()}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Save US ${(product.price * 0.05).toFixed(2)} (5% off)
              </p>
            </div>

            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-semibold w-24">
                Condition:
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Excellent - Refurbished</span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "Item is refurbished in 'A' stock, has been fully tested, and
                  is in perfect working order guaranteed!"...{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:underline font-normal not-italic"
                  >
                    Read more
                  </a>
                </p>
              </div>
            </div>

            {/* Countdown timer - chỉ hiện khi isAuction = true */}
            {product.isAuction && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-700 font-semibold w-24">
                  {timeLeft === "Auction ended" ? "Auction:" : "Time left:"}
                </span>
                <span className={`font-bold ${timeLeft === "Auction ended" ? "text-gray-600" : "text-red-600"}`}>
                  {timeLeft}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-gray-700 font-semibold w-24">
                Quantity:
              </span>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 border border-gray-300 rounded px-3 py-2 text-center"
                />
                <span className="text-sm text-gray-600">189 available</span>
                <span className="text-sm text-red-600 font-semibold">
                  · {randomSold} sold
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <svg
                className="w-8 h-8 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  263,100.00 VND off with code TOPFINDS25
                </p>
                <p className="text-sm text-gray-600">Ends 11 Nov</p>
              </div>
              <a
                href="#"
                className="text-blue-600 hover:underline font-semibold text-sm whitespace-nowrap"
              >
                See details
              </a>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 mb-6">
              {product.isAuction ? (
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-lg transition"
                  onClick={() => router.push(`/products/${product._id}/bid`)}
                >
                  Place bid
                </button>
              ) : (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-lg transition">
                  Buy It Now
                </button>
              )}

              {!product.isAuction && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-full text-lg transition"
                >
                  Add to cart
                </button>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  No Interest if paid in full in 6 mo on $99+
                </span>
                <a href="#" className="text-blue-600 hover:underline">
                  Details
                </a>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-gray-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    eBay Money Back Guarantee
                  </p>
                  <p className="text-gray-600">
                    Get the item you ordered or get your money back.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex border-b border-gray-300 mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 text-base font-semibold ${activeTab === "description"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Item description
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`px-6 py-3 text-base font-semibold ${activeTab === "shipping"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Shipping and payments
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 text-base font-semibold ${activeTab === "reviews"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed space-y-3 
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
                  [&_ul]:list-disc [&_ul]:ml-5 [&_li]:mb-1
                  [&_strong]:font-semibold [&_strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">
                    Free international shipping
                  </p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery: 10-15 business days
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Ships to: Worldwide</p>
                <p>• Excludes: Some locations</p>
                <p>• Payment methods: PayPal, Credit Card, Apple Pay</p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {reviews.length === 0 ? (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <ul className="space-y-6">
                  {reviews.map((r, index) => (
                    <li
                      key={r._id}
                      className={`pb-6 ${index !== reviews.length - 1
                        ? "border-b border-gray-200"
                        : ""
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={r.reviewerId?.avatarURL || "/user.png"}
                          alt={r.reviewerId?.email}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {r.reviewerId?.email}
                            </p>
                            <p className="text-yellow-500 text-lg">
                              {"★".repeat(r.rating)}
                              {"☆".repeat(5 - r.rating)}
                            </p>
                          </div>
                          <p className="text-gray-700 mb-2">{r.comment}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}