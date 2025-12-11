"use client";
import React, { forwardRef, useEffect, useRef, useState } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled = false,
      onClick,
      isLoading,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef(null);
    const buttonRef = ref || internalRef;
    const [fixedWidth, setFixedWidth] = useState(0);

    const sizeClasses = {
      sm: "px-[20px] py-[10px] min-w-[100px] h-[40px]",
      md: "px-[20px] py-[10px] min-w-[168px] h-[44px]",
      lg: "px-6 py-3 text-lg min-w-[170px] h-[56px]",
    };

    const iconSize = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-6 h-6",
    };

    const variantClasses = {
      primary: `bg-[#0968f6] text-white border-transparent focus-ring-blue-200 
                disable:bg-blue-200 hover:disabled:bg-[#0968f6] active:disabled:bg-[#0968f6]
                hover:bg-blue-700 active:bg-blue-600 `,
      light: `bg-white text-[#191919] border border-[#191919]
              disabled:bg-gray-100 disabled:text-gray-400 hover:disabled:bg-white active:disabled:bg-white
              hover:bg-gray-100 active:bg-gray-200 `,
      dark: `text-[#f7f7f7] bg-[#191919] 
             disabled:bg-[#191919] hover:disabled:bg-[#191919] active:disabled:bg-[#191919]
             hover:bg-[#2c2c2c] active:bg-[#000000] `,
    };

    const baseClasses = `
        inline-flex items-center justify-center transition-all duration-200 cursor-pointer font-bold
        focus:outline-none rounded-full disabled:cursor-not-allowed disabled:opacity-40 border 
        ${variantClasses[variant]}
        ${fullWidth ? "w-full" : ""}
        ${sizeClasses[size]}
        ${className}
        `;
    const handleClick = (e) => {
      if (disabled) return;
      if (onClick) onClick(e);
    };

    const LoadingSpinner = ({ size }) => {
      return (
        <div
          className={`animate-spin rounded-full border-b-2 border-current ${iconSize[size]}`}
        ></div>
      );
    };

    useEffect(() => {
      if (!isLoading && buttonRef.current) {
        setFixedWidth(buttonRef.current.offsetWidth);
      }
    }, [isLoading, buttonRef]);
    return (
      <button
        onClick={handleClick}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
        style={fixedWidth ? { width: fixedWidth } : {}}
        ref={buttonRef}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
          </>
        ) : (
          <>{children && <span>{children}</span>}</>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
