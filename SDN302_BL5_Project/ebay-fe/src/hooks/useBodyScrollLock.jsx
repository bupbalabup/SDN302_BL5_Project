import { useEffect } from "react";

export default function useBodyScrollLock(isLocked) {
    useEffect(() => {
        if (isLocked) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            const originalScrollY = window.scrollY;
            const body = document.body;

            body.style.overflow = "hidden";
            body.style.position = "fixed";
            body.style.top = `-${originalScrollY}px`;
            body.style.left = "0";
            body.style.right = "0";

            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                body.style.overflow = "";
                body.style.position = "";
                body.style.top = "";
                body.style.left = "";
                body.style.right = "";
                body.style.paddingRight = "";
                window.scrollTo(0, originalScrollY);
            };
        }
    }, [isLocked]);
}