"use client";
import { Carousel } from "antd";
import { useRef, useState, useEffect } from "react";
import {
  LeftOutlined,
  RightOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getCategories } from "@/services/categoryService";

export default function HomePage() {
  const carouselRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const scrollRef = useRef(null);

  const categoryImages = {
    Automotive:
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/hjsAAeSwgDlo2len/$_57.JPG",
    "Books & Media":
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/MloAAeSwr4po2len/$_57.JPG",
    Collectibles:
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/oyoAAeSwYnFo2len/$_57.JPG",
    "Computers & Tablets":
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/~R4AAeSwPNZo2len/$_57.JPG",
    Electronics:
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/KBcAAeSwCSlo2ldK/$_57.JPG",
    Fashion:
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/hpYAAeSwg5Vo2len/$_57.JPG",
    "Health & Beauty":
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/FQAAAeSwGrFo2lfS/$_57.JPG",
    "Home & Garden":
      "https://i.ebayimg.com/00/s/Mjg4WDI4OA==/z/L0YAAeSwHgZo2len/$_57.JPG",
    "Sporting Goods":
      "https://i.ebayimg.com/images/g/5MgAAeSwKtdoraa4/s-l2400.png",
    "Toys & Hobbies":
      "https://i.ebayimg.com/thumbs/images/g/A00AAeSwiaJojMG9/s-l1200.webp",
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh mục:", err);
      }
    }
    loadCategories();
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const toggleAutoPlay = () => {
    setAutoPlay((p) => !p);
  };

  const onChange = (current) => {};

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Hero Banner Section */}
      <section className="w-full bg-white py-8">
        <div className="max-w-[1488px] mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Welcome to eBay!
          </h1>

          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <Carousel
              ref={carouselRef}
              className="w-full h-[360px]"
              autoplay={autoPlay}
              autoplaySpeed={3000}
              dots
              afterChange={onChange}
            >
              {/* Banner 1 */}
              <div>
                <div className="flex w-full h-[360px] bg-black text-white">
                  <div className="w-1/2 h-full flex flex-col justify-center px-16 bg-[#191919]">
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                      Celebrate eBay's anniversary
                    </h2>
                    <p className="text-lg text-gray-300 mb-8">
                      30 years of collecting. Millions of items. Endless
                      adventures.
                    </p>
                    <button className="bg-white text-[#191919] font-semibold rounded-full px-8 py-3 hover:bg-gray-100 transition w-fit text-base">
                      Keep collecting
                    </button>
                  </div>
                  <div className="w-1/2 h-full bg-[#191919]">
                    <a href="#" className="block w-full h-full">
                      <img
                        src="https://i.ebayimg.com/images/g/1OwAAeSwgpposG~R/s-l960.webp"
                        alt="eBay banner"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* Banner 2 */}
              <div>
                <div className="flex w-full h-[360px] bg-[#E99A02] px-16">
                  <div className="w-2/5 h-full flex flex-col justify-center pr-8">
                    <h2 className="text-4xl font-bold text-[#562F01] leading-tight mb-4">
                      Whatever you're into, it's here
                    </h2>
                    <p className="text-lg text-[#562F01] mb-8">
                      Turn a wrench, get a tech upgrade, and find everything you
                      love.
                    </p>
                    <a
                      href="#"
                      className="bg-[#562F01] text-[#E99A02] font-semibold rounded-full px-8 py-3 hover:opacity-90 transition w-fit text-base"
                    >
                      Do your thing
                    </a>
                  </div>
                  <div className="w-3/5 h-full flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8">
                      {[
                        {
                          img: "https://i.ebayimg.com/images/g/tgUAAOSwkKJnycJx/s-l300.webp",
                          label: "Motors",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/ZC8AAOSwU8dnycJ2/s-l300.webp",
                          label: "Electronics",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/YkcAAOSwd0FnycJ4/s-l300.webp",
                          label: "Collectibles",
                        },
                      ].map((item, idx) => (
                        <a
                          key={idx}
                          href="#"
                          className="flex flex-col items-center group"
                        >
                          <div className="w-32 h-32 flex items-center justify-center">
                            <img
                              src={item.img}
                              alt={item.label}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <span className="mt-3 text-xl font-semibold text-[#562F01] group-hover:underline">
                            {item.label} &gt;
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner 3 */}
              <div>
                <div className="flex w-full h-[360px] bg-[#00A2E8] px-16">
                  <div className="w-2/5 h-full flex flex-col justify-center pr-8">
                    <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
                      All your faves are here
                    </h2>
                    <p className="text-lg text-gray-900 mb-8">
                      Refresh your space, elevate your style and power your
                      work.
                    </p>
                    <a
                      href="#"
                      className="bg-gray-900 text-[#00A2E8] font-semibold rounded-full px-8 py-3 hover:bg-gray-800 transition w-fit text-base"
                    >
                      Do your thing
                    </a>
                  </div>
                  <div className="w-3/5 h-full flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8">
                      {[
                        {
                          img: "https://i.ebayimg.com/images/g/apEAAOSwVN1n4r~-/s-l300.webp",
                          label: "Home & Garden",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/Pr8AAOSw4E5n4sAC/s-l300.webp",
                          label: "Fashion",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/kUgAAOSwPedn4sAG/s-l300.webp",
                          label: "Business",
                        },
                      ].map((item, idx) => (
                        <a
                          key={idx}
                          href="#"
                          className="flex flex-col items-center group"
                        >
                          <div className="w-32 h-32 flex items-center justify-center">
                            <img
                              src={item.img}
                              alt={item.label}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <span className="mt-3 text-xl font-semibold text-gray-900 group-hover:underline">
                            {item.label} &gt;
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner 4 */}
              <div>
                <div className="flex w-full h-[360px] bg-[#E99A02] px-16">
                  <div className="w-2/5 h-full flex flex-col justify-center pr-8">
                    <h2 className="text-4xl font-bold text-[#562F01] leading-tight mb-4">
                      Build an elite collection
                    </h2>
                    <p className="text-lg text-[#562F01] mb-8">
                      Choose your next adventure from thousands of finds.
                    </p>
                    <a
                      href="#"
                      className="bg-[#562F01] text-[#E99A02] font-semibold rounded-full px-8 py-3 hover:opacity-90 transition w-fit text-base"
                    >
                      Start your journey
                    </a>
                  </div>
                  <div className="w-3/5 h-full flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8">
                      {[
                        {
                          img: "https://i.ebayimg.com/images/g/5-8AAeSwpvJotaqH/s-l300.webp",
                          label: "Trading cards",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/PkIAAeSwZ05otaqK/s-l300.webp",
                          label: "Toys",
                        },
                        {
                          img: "https://i.ebayimg.com/images/g/7ykAAeSwYXRotaqP/s-l300.webp",
                          label: "Sports cards",
                        },
                      ].map((item, idx) => (
                        <a
                          key={idx}
                          href="#"
                          className="flex flex-col items-center group"
                        >
                          <div className="w-32 h-32 flex items-center justify-center">
                            <img
                              src={item.img}
                              alt={item.label}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <span className="mt-3 text-xl font-semibold text-[#562F01] group-hover:underline">
                            {item.label} &gt;
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Carousel>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 right-6 flex gap-3 z-30">
              <button
                onClick={() => carouselRef.current.prev()}
                className="bg-white/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full hover:bg-white shadow-lg transition-all"
                aria-label="Previous slide"
              >
                <LeftOutlined className="text-gray-800 text-lg" />
              </button>
              <button
                onClick={() => carouselRef.current.next()}
                className="bg-white/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full hover:bg-white shadow-lg transition-all"
                aria-label="Next slide"
              >
                <RightOutlined className="text-gray-800 text-lg" />
              </button>
              <button
                onClick={toggleAutoPlay}
                className="bg-white/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full hover:bg-white shadow-lg transition-all"
                aria-label={autoPlay ? "Pause autoplay" : "Play autoplay"}
              >
                {autoPlay ? (
                  <PauseOutlined className="text-gray-800 text-lg" />
                ) : (
                  <CaretRightOutlined className="text-gray-800 text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full bg-white py-12 mt-8">
        <div className="max-w-[1488px] mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Explore the catalog
          </h2>

          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all z-10 border border-gray-200"
            >
              <LeftOutlined className="text-gray-800 text-xl" />
            </button>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide px-2 py-4"
              style={{ scrollBehavior: "smooth", overflowY: "hidden" }}
            >
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
                  style={{ width: "140px" }}
                  onClick={() => router.push(`/products`)}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-white shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                    <img
                      src={categoryImages[cat.name] || "/placeholder.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-4 font-semibold text-center text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all z-10 border border-gray-200"
            >
              <RightOutlined className="text-gray-800 text-xl" />
            </button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .slick-slider .slick-dots {
          bottom: 20px;
        }
        .slick-dots li {
          margin: 0 4px;
        }
        .slick-dots li button {
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.5) !important;
          border: none !important;
          padding: 0 !important;
          cursor: pointer;
          transition: all 0.3s ease !important;
        }
        .slick-dots li.slick-active button {
          background: white !important;
          width: 12px !important;
          height: 12px !important;
        }
        .slick-dots li button:before {
          display: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
