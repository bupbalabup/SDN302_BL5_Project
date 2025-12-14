"use client";
import { getUserInfo } from "@/services/userService";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("No token found in URL");
        return;
      }

      try {
        // ✅ Giải mã token nếu cần (tuỳ bạn dùng hay không)
        const decoded = jwtDecode(token);
        console.log("Decoded user:", decoded);

        // ✅ Lưu token vào localStorage (hoặc sessionStorage)
        localStorage.setItem("accessToken", token);

        // ✅ Gọi API để lấy thông tin user
        const res = await getUserInfo(); // API này sẽ tự thêm Authorization
        const user = res.data?.user;

        if (!user) throw new Error("No user returned from server");

        // ✅ Lưu thông tin user
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Điều hướng về trang chủ
        router.push("/");
      } catch (err) {
        console.error("Google login error:", err);
        setError("Google login failed. Please try again.");
      }
    };

    handleGoogleLogin();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>Logging in with Google...</p>
      )}
    </div>
  );
}
