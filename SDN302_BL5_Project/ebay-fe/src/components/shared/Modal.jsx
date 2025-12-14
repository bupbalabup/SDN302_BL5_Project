"use client";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  size = "md",
  title = "heading",
  children,
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  useBodyScrollLock(open);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 "
      onClick={onClose}
      style={{ display: open ? "flex" : "none" }}
    >
      <div
        className={`bg-white relative shadow-lg w-full rounded-2xl ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="pt-3 px-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        <button
          className="cursor-pointer hover:bg-black/10 rounded-full text-[#191919] absolute right-2 top-2 w-[24px] h-[24px]"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
