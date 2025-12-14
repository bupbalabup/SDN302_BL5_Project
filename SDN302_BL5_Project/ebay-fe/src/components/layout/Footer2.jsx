'use client'
import React from "react";
import Link from "next/link";

function Footer2() {
  return (
    <footer className="w-full border-t border-[#e5e5e5] bg-[#f7f7f7] py-4 px-6 text-[#555]" style={{fontSize: 11}}>
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center gap-1">
        {/* Bên trái: copyright */}
        <div>
          Copyright © 1995-2025 eBay Inc. All Rights Reserved.
        </div>

        {/* Bên phải: các link */}
        <div className="flex flex-wrap gap-x-1 text-[blue] underline">
          <Link href="#" className="hover:underline">Accessibility</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">User Agreement</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">Privacy</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">Consumer Health Data</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">Payments Terms of Use</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">Cookies</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">A Privacy Notice</Link>
          <span>,</span>
          <Link href="#" className="hover:underline">Your Privacy Choices and AdChoice</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer2;
