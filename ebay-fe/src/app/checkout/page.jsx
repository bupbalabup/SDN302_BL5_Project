"use client";
import Loading from "@/components/shared/Loading";
import Checkout from "@/components/ui/CheckOut/Checkout";
import { getUserFromStorage } from "@/lib/utils";
import cartService from "@/services/cartService";
import { getUserCoupons } from "@/services/userService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({});
  const [coupons, setCoupons] = useState({});
  const router = useRouter();

  const fetchCoupons = async () => {
    try {
      const data = await getUserCoupons();
      setCoupons(data.myCoupons);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartService.getCartForCheckout();
      setCart(data.cart);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const storedUser = getUserFromStorage(localStorage, sessionStorage);
    setUser(storedUser);
    if (storedUser) {
      fetchCart();
      fetchCoupons();
    } else {
      router.push("/login");
    }
  }, []);
  if (!user) return <Loading />;
  return (
    <Checkout onCartUpdate={fetchCart} cart={cart} coupons={coupons}></Checkout>
  );
};

export default CheckoutPage;
