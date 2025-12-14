"use client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { UserOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { logoutUser } from "@/services/authService";
import ChangePasswordModal from "./ChangePasswordModal";
import NotificationModal from "./NotificationModal";
import { useRouter } from "next/navigation";
import { getNotifications, maskAsRead } from "@/services/notificationService";
import { timeAgo } from "@/lib/utils";
import cartService from "@/services/cartService";
import { clearCartLocal } from "@/lib/cartLocal";

// Helper function để lấy user từ Local hoặc Session Storage
const getUserFromStorage = () => {
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function Header() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotification] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // fetch data
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setUnreadCount(data.unReadCount);
      setNotification(
        data.notifications.map((noti) => ({
          ...noti,
          time: timeAgo(noti.time),
        }))
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const fetchCartCount = async () => {
    try {
      const data = await cartService.getCart();
      const items = data.cart?.items || [];
      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // handlers
  const handleClickNoti = async (id, link) => {
    try {
      const data = await maskAsRead(id);
    } catch (error) {
      console.error(error);
    } finally {
      fetchNotifications();
      router.push(link);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== "") {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/products");
    }
  };
  const handleLogout = async () => {
    try {
      // Vẫn giữ logic kiểm tra token cũ
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const data = stored ? JSON.parse(stored) : null;
      const refreshToken =
        data?.refreshToken ||
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken");

      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      // Dọn dẹp cả localStorage và sessionStorage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user"); // Đã thêm
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      clearCartLocal();
      setUser(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const userData = getUserFromStorage(localStorage, sessionStorage);
    if (userData) {
      fetchNotifications();
      setUser(userData);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const userData = getUserFromStorage(localStorage, sessionStorage);
    if (userData) setUser(userData);
    fetchCartCount();
    const handleUpdate = () => fetchCartCount();
    window.addEventListener("cart_updated", handleUpdate);
    return () => {
      window.removeEventListener("cart_updated", handleUpdate);
    };
  }, []);

  return (
    <header className="">
      <nav className="border-b border-[#e5e5e5] flex justify-center px-[24px] py-[10px]">
        <div className="container flex justify-between items-center h-[32px]">
          <ul className="flex gap-[8px]">
            <li className="nav-link relative">
              {!isLoading && (
                <>
                  {user ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setShowUserMenu(true)}
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <span className="font-medium cursor-pointer">
                        Hi {user.fullname}!
                      </span>
                      <Image
                        src={"/icons/chevron_down.svg"}
                        width={10}
                        height={10}
                        alt=""
                        className="inline ml-1"
                      />

                      {showUserMenu && (
                        <div
                          className="absolute top-full left-0 bg-white shadow-lg rounded-lg w-[250px] z-50 border border-gray-200"
                          onMouseEnter={() => setShowUserMenu(true)}
                          onMouseLeave={() => setShowUserMenu(false)}
                        >
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                <UserOutlined className="text-gray-500 text-2xl" />
                              </div>

                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">
                                  {user.fullname}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              href="/account/settings"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Account settings
                            </Link>
                            <button
                              onClick={() => setShowChangePassword(true)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Change password
                            </button>
                            <Link
                              href="/order"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Order history
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      Hi (
                      <Link
                        href={"/login"}
                        className="text-[#0968f6] font-medium underline"
                      >
                        Sign-in
                      </Link>
                      /
                      <Link
                        href={"/register"}
                        className="text-[#0968f6] font-medium underline"
                      >
                        Sign-up
                      </Link>
                      )
                    </>
                  )}
                </>
              )}
            </li>
            <li>
              <Link className="nav-link" href={"/"}>
                Daily Deals
              </Link>
            </li>
            <li>
              <Link className="nav-link" href={"/"}>
                Brand Outlet
              </Link>
            </li>
            <li>
              <Link className="nav-link" href={"/"}>
                Gift Cards
              </Link>
            </li>
            <li>
              <Link className="nav-link" href={"/"}>
                Help & Contact
              </Link>
            </li>
          </ul>
          <ul className="flex items-center gap-[12px]">
            <li>
              <Link className="nav-link" href={"/"}>
                Ship to
              </Link>
            </li>
            <li>
              <Link className="nav-link" href={"/"}>
                Sell
              </Link>
            </li>
            <li>
              <Link className="nav-link flex items-center gap-[4px]" href={"/"}>
                Watchlist
                <Image
                  src={"/icons/chevron_down.svg"}
                  width={12}
                  height={12}
                  alt=""
                />
              </Link>
            </li>
            <li>
              <Link className="nav-link flex items-center gap-[4px]" href={"/"}>
                My eBay
                <Image
                  src={"/icons/chevron_down.svg"}
                  width={12}
                  height={12}
                  alt=""
                />
              </Link>
            </li>
            <li
              className="nav-link relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              {unreadCount > 0 && (
                <span className="text-white text-[12px] flex items-center justify-center rounded-full font-semibold absolute top-[-3px] right-[2px] bg-red-500 w-[16px] h-[16px]">
                  {unreadCount}
                </span>
              )}

              <div className="cursor-pointer">
                <Image
                  src="/icons/bell.svg"
                  width={20}
                  height={20}
                  alt="Bell icon"
                />
              </div>

              <NotificationModal
                router
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                handleClick={handleClickNoti}
              />
            </li>
            <li className="nav-link relative">
              <button
                onClick={() => router.push("/cart")}
                aria-label="View cart"
                className="relative"
              >
                <Image
                  src={"/icons/cart.svg"}
                  width={20}
                  height={20}
                  alt="Cart"
                />
                {cartCount > 0 && (
                  <span className="absolute top-[-5px] right-[-8px] text-white bg-red-500 w-[16px] h-[16px] flex items-center justify-center font-semibold rounded-full ">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="border-b border-[#e5e5e5] flex justify-center py-[20px] px-[24px]">
        <div className="container flex items-center gap-[20px]">
          <div className="flex items-center gap-[16px]">
            <Link href={"/"}>
              <Image
                src={"/images/EBay_logo.svg.png"}
                alt="Ebay logo"
                width={117}
                height={48}
              />
            </Link>
            <div className="flex cursor-pointer">
              <span className="text-[#707070] text-[12px]/[14px] font-semibold line w-[70px]">
                Shop by category
              </span>
              <Image
                src={"/icons/chevron_down.svg"}
                width={12}
                height={12}
                alt=""
              />
            </div>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-[16px]"
          >
            <div className="w-full flex items-center border-[2px] border-[#191919] rounded-full h-[44px] overflow-hidden">
              <div className="pl-4">
                <Image
                  src={"/icons/search.svg"}
                  width={16}
                  height={16}
                  alt=""
                />
              </div>

              <input
                type="text"
                placeholder="Search for anything"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="form_btn flex items-center gap-[8px]">
              <Button>Search</Button>
              <Link
                href={"/"}
                className="text-[#707070] text-[11px] font-semibold"
              >
                Advanced
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
}
