"use client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  let rightContent;
  if (pathname === "/register") {
    rightContent = (
      <Link
        href="/login"
        className="text-[#6f0070] hover:underline text-sm font-medium"
      >
        Already have an account? <span className="font-semibold">Sign in</span>
      </Link>
    );
  } else if (pathname === "/login") {
    rightContent = (
      <Link
        href="/feedback"
        className="text-[#6f0070] hover:underline text-sm font-medium"
      >
        Tell us what you think
      </Link>
    );
  }

  return (
    <header>
      <div className="border-b border-[#e5e5e5] flex justify-center py-[20px] px-[24px]">
        <div className="w-full flex items-center justify-between gap-[20px]">
          {/* Logo */}
          <div className="flex items-center gap-[16px]">
            <Link href={"/"}>
              <Image
                src={"/images/EBay_logo.svg.png"}
                alt="Ebay logo"
                width={117}
                height={48}
              />
            </Link>
          </div>

          {/* Link bên phải */}
          <div className="flex items-center">{rightContent}</div>
        </div>
      </div>
    </header>
  );
}
