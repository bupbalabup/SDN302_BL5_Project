"use client";
import React, { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const searchParams = useSearchParams();
  const [order, setOrder] = useState("asc");
  const [listingType, setListingType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const router = useRouter();
  const search = searchParams.get("search") || "";

  const getRandomSold = () => Math.floor(Math.random() * 1000) + 1;
  function formatTimeLeft(endTime) {
    if (!endTime) return "";

    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${mins}m`;
  }

  const fetchProducts = async () => {
    try {
      const params = {
        page,
        limit: 12,
        name: search,
        category: selectedCategory || undefined,
        order,
        listingType,
      };
      const data = await getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, search, order, listingType]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div
      className="bg-white min-h-screen font-sans"
      style={{
        fontFamily: "'Market Sans', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white p-5 sticky top-6">
              <h2 className="font-bold text-lg mb-4">Shop by category</h2>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                    selectedCategory === "" ? "font-semibold" : ""
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      selectedCategory === cat.name ? "font-semibold" : ""
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Filter Bar */}
            <div className="p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {/* All Listings */}
                  <button
                    onClick={() => setListingType("all")}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      listingType === "all"
                        ? "bg-gray-900 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All Listings
                  </button>

                  {/* Auction */}
                  <button
                    onClick={() => setListingType("auction")}
                    className={`px-4 py-2 rounded-full text-sm ${
                      listingType === "auction"
                        ? "bg-gray-900 text-white font-semibold"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Auction
                  </button>

                  {/* Buy It Now */}
                  <button
                    onClick={() => setListingType("buy")}
                    className={`px-4 py-2 rounded-full text-sm ${
                      listingType === "buy"
                        ? "bg-gray-900 text-white font-semibold"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Buy It Now
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="asc">Sort: Price Low to High</option>
                    <option value="desc">Sort: Price High to Low</option>
                  </select>

                  <div className="flex border border-gray-300 rounded">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 ${
                        viewMode === "list"
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      }`}
                      title="List view"
                    >
                      ☰
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 border-l ${
                        viewMode === "grid"
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      }`}
                      title="Grid view"
                    >
                      ▦
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {products.length} results
              </div>
            </div>

            {/* Products List/Grid */}
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : viewMode === "list" ? (
              // List View
              <div className="space-y-5">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="hover:shadow-sm transition-shadow cursor-pointer pb-5 border-b border-gray-100"
                    onClick={() => router.push(`/products/${p._id}`)}
                  >
                    <div className="flex gap-5">
                      {/* Product Image */}
                      <div className="w-72 h-72 flex-shrink-0 bg-gray-50 relative">
                        <img
                          src={p.images?.[0] || "/placeholder.png"}
                          alt={p.title}
                          className="w-full h-full object-contain p-4"
                        />
                        {/* Wishlist Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="absolute top-3 right-3 p-2 hover:bg-white rounded-full bg-white/80"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600 hover:text-red-500"
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
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 py-2">
                        <h3 className="text-lg font-normal text-gray-900 hover:underline mb-1 cursor-pointer">
                          {p.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                          Excellent - Refurbished ·{" "}
                          {p.categoryId?.name || "No category"}
                        </p>

                        <div className="mb-3">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ${p.price.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-500 line-through">
                            Was: ${(p.price * 1.2).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          Free international shipping
                        </p>
                        <p className="text-sm text-red-600 mb-3">
                          {getRandomSold()} sold
                        </p>

                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-semibold text-gray-900">
                            eBay Refurbished
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">Sponsored</p>
                      </div>
                      {p.isAuction && (
                            <div className="flex flex-col justify-center items-end ml-auto pr-3 text-sm">
                              <span className="text-gray-600">
                                {p.bidCount} {p.bidCount === 1 ? "bid" : "bids"}
                              </span>

                              <span className="font-semibold text-black">
                                {formatTimeLeft(p.auctionEndTime)}
                              </span>
                            </div>
                          )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => router.push(`/products/${p._id}`)}
                  >
                    <div className="relative bg-gray-50 overflow-hidden">
                      <div className="aspect-square">
                        <img
                          src={p.images?.[0] || "/placeholder.png"}
                          alt={p.title}
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 p-2 hover:bg-white rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 hover:text-red-500"
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
                      </button>
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-normal text-gray-900 hover:underline line-clamp-2 mb-3 min-h-[2.5rem]">
                        {p.title}
                      </h3>

                      <div>
                        <p className="text-xl font-bold text-gray-900 mb-1">
                          ${p.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 line-through mb-2">
                          Was: ${(p.price * 1.2).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          Free international shipping
                        </p>
                        <p className="text-sm text-red-600">
                          {getRandomSold()} sold
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(7, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded text-sm ${
                          page === pageNum
                            ? "bg-blue-600 text-white font-bold"
                            : "border border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
