// import React, { useEffect, useMemo, useState } from "react";

// const ItemsCategory = ({ apiEndpoint }) => {
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState(""); // "", "price-asc", "price-desc"

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(apiEndpoint);
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         const data = await res.json();
//         setItems(data);
//       } catch (err) {
//         console.error("❌ Fetch products error:", err);
//       }
//     };
//     fetchData();
//   }, [apiEndpoint]);

//   // Hàm định dạng giá tiền sang VND
//   const formatPrice = (num) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(num);

//   // ✅ lọc + sắp xếp
//   const filteredItems = useMemo(() => {
//     let data = [...items];

//     // filter theo tên
//     if (search.trim() !== "") {
//       data = data.filter((item) =>
//         item.title.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     // sort
//     if (sortBy === "price-asc") {
//       data.sort((a, b) => a.price - b.price);
//     } else if (sortBy === "price-desc") {
//       data.sort((a, b) => b.price - a.price);
//     }

//     return data;
//   }, [items, search, sortBy]);

//   return (
//     <section className="w-full max-w-6xl mx-auto my-10 flex gap-6">
//       {/* ====== ASIDE FILTER ====== */}
//       <aside className="w-64 bg-white rounded-2xl shadow-sm p-5 h-fit sticky top-6 border border-gray-100">
//         <h2 className="text-base font-semibold text-gray-800 mb-4 tracking-tight">
//           Bộ lọc
//         </h2>

//         {/* Search by name */}
//         <div className="mb-5">
//           <label className="text-sm font-medium text-gray-700">
//             Tìm theo tên
//           </label>
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Nhập tên sản phẩm..."
//             className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800
//                        placeholder:text-gray-400 bg-white"
//           />
//         </div>

//         {/* Sort by checkbox */}
//         <div className="mb-5">
//           <label className="text-sm font-medium text-gray-700 block mb-2">
//             Sắp xếp theo
//           </label>

//           <div className="flex flex-col gap-2">
//             <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition">
//               <input
//                 type="checkbox"
//                 checked={sortBy === "price-asc"}
//                 onChange={() =>
//                   setSortBy(sortBy === "price-asc" ? "" : "price-asc")
//                 }
//                 className="accent-blue-500 cursor-pointer"
//               />
//               <span className="text-sm text-gray-800">Giá thấp → cao</span>
//             </label>

//             <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition">
//               <input
//                 type="checkbox"
//                 checked={sortBy === "price-desc"}
//                 onChange={() =>
//                   setSortBy(sortBy === "price-desc" ? "" : "price-desc")
//                 }
//                 className="accent-blue-500 cursor-pointer"
//               />
//               <span className="text-sm text-gray-800">Giá cao → thấp</span>
//             </label>
//           </div>
//         </div>

//         <div className="pt-3 border-t border-gray-100">
//           <p className="text-xs text-gray-500">
//             {filteredItems.length} kết quả hiển thị
//           </p>
//         </div>
//       </aside>

//       {/* ====== LIST SẢN PHẨM ====== */}
//       <div className="flex-1 flex flex-col gap-6">
//         {filteredItems.length > 0 ? (
//           filteredItems.map((item) => {
//             const {
//               image,
//               title,
//               price,
//               shipping,
//               watching,
//               condition,
//               brand,
//             } = item;

//             return (
//               <div
//                 key={item.id}
//                 className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer"
//               >
//                 {/* Ảnh sản phẩm */}
//                 <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
//                   <img
//                     src={image}
//                     alt={title}
//                     className="w-full h-full object-cover"
//                   />
//                   {/* Icon yêu thích */}
//                   <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:scale-110 transition-transform duration-200">
//   <span className="text-gray-700 text-xl leading-none">
//     ♡
//   </span>
// </div>
//                 </div>

//                 {/* Nội dung bên phải */}
//                 <div className="flex flex-col justify-between ml-4 py-1 flex-1">
//                   <div>
//                     {/* Tiêu đề sản phẩm */}
//                     <h3 className="text-sm font-medium text-gray-900 leading-snug hover:underline">
//                       {title}
//                     </h3>

//                     {/* Tình trạng & thương hiệu */}
//                     <p className="text-xs text-gray-500 mt-1 mb-2">
//                       {condition} {brand && `• ${brand}`}
//                     </p>

//                     {/* Giá */}
//                     <p className="text-2xl font-bold text-gray-900 mb-1">
//                       {formatPrice(price)}
//                     </p>

//                     {/* Ghi chú */}
//                     <p className="text-sm text-gray-600 mb-1">or Best Offer</p>

//                     {/* Phí ship */}
//                     <p className="text-sm text-gray-500 mb-1">
//                       {formatPrice(shipping)} shipping
//                     </p>

//                     {/* Số người xem hoặc cảnh báo còn ít hàng */}
//                     {watching && (
//                       <p
//                         className={`text-xs font-medium ${
//                           watching.includes("Only")
//                             ? "text-red-600"
//                             : "text-pink-600"
//                         }`}
//                       >
//                         {watching}
//                       </p>
//                     )}
//                   </div>

//                   {/* Sponsored */}
//                   <p className="text-xs text-gray-400 mt-1">Sponsored</p>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <p className="text-gray-500 text-center">Loading...</p>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ItemsCategory;

import Footer2 from "@/components/layout/Footer2";
import { Footer } from "antd/es/layout/layout";
import React, { useEffect, useMemo, useState } from "react";
import AuctionPage from "../Auction/AuctionPage";

const ItemsCategory = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        title:
          "AMD BC-250 16GB GDDR6 PlayStation 5 APU Single Card + 16GB M.2 SSD INCLUDED",
        image:
          "https://res.cloudinary.com/dehyvlweg/image/upload/v1753085337/0e190589111b3c28e1451cde7b82ca3e_wguc0y.webp",
        price: 2501730,
        shipping: 2371640.04,
        watching: "117 watching",
        condition: "Pre-Owned",
        brand: "ASRock",
        sponsored: true,
      },
      {
        id: 2,
        title:
          "Microsoft Surface Laptop 3/4gen 1867-1950 13.5'' LCD Touch Screen Digitizer Black",
        image: "https://i.ebayimg.com/images/g/fKAAAOSwoSVmqQxM/s-l1600.jpg",
        price: 3686760,
        shipping: 1316700,
        watching: "",
        condition: "Brand New",
        brand: "Microsoft",
        sponsored: true,
      },
      {
        id: 3,
        title:
          "US Beelink Mini PC, AMD Ryzen 5 5500U(6C/12T, Up to 4.0GHz), 16GB DDR4 RAM 500GB",
        image: "https://i.ebayimg.com/images/g/WjYAAOSwLPZmGAVR/s-l1600.jpg",
        price: 4608450,
        shipping: 2768756.76,
        watching: "Only 1 left!",
        condition: "Open Box",
        brand: "",
        sponsored: true,
      },
    ];
    setItems(sampleData);
  }, []);

  const formatPrice = (num) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (search.trim() !== "") {
      data = data.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 2. Sort
    if (sortBy === "price-asc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      data.sort((a, b) => b.price - a.price);
    }

    return data;
  }, [items, search, sortBy]);

  return (
    <section>
      <div className="w-full max-w-6xl mx-auto my-10 flex gap-6">
        {/* Sidebar filter */}
        <aside className="w-64 bg-white rounded-2xl shadow-sm p-5 h-fit sticky top-6 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 tracking-tight">
            Bộ lọc
          </h2>

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700">
              Tìm theo tên
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800
                 placeholder:text-gray-400 bg-white"
            />
          </div>

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Sắp xếp theo
            </label>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition">
                <input
                  type="checkbox"
                  checked={sortBy === "price-asc"}
                  onChange={() =>
                    setSortBy(sortBy === "price-asc" ? "" : "price-asc")
                  }
                  className="accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-800">Giá thấp → cao</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition">
                <input
                  type="checkbox"
                  checked={sortBy === "price-desc"}
                  onChange={() =>
                    setSortBy(sortBy === "price-desc" ? "" : "price-desc")
                  }
                  className="accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-800">Giá cao → thấp</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Danh sách sản phẩm */}
        <div className="flex-1 flex flex-col gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const {
                id,
                image,
                title,
                price,
                shipping,
                watching,
                condition,
                brand,
                sponsored,
              } = item;

              return (
                <div
                  key={id}
                  className="flex rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer"
                >
                  <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:scale-110 transition-transform duration-200">
                      <span className="text-gray-700 text-xl leading-none">
                        ♡
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between ml-4 py-1 flex-1">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 leading-snug hover:underline">
                        {title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1 mb-2">
                        {condition} {brand && `• ${brand}`}
                      </p>

                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatPrice(price)}
                      </p>

                      <p className="text-sm text-gray-600 mb-1">
                        or Best Offer
                      </p>

                      <p className="text-sm text-gray-500 mb-1">
                        {formatPrice(shipping)} shipping
                      </p>

                      {watching && (
                        <p
                          className={`text-xs font-medium ${
                            watching.includes("Only")
                              ? "text-red-600"
                              : "text-pink-600"
                          }`}
                        >
                          {watching}
                        </p>
                      )}
                    </div>

                    {sponsored && (
                      <p className="text-xs text-gray-400 mt-1">Sponsored</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          )}
        </div>
      </div>
      <div>
        <Footer2 />
      </div>
      
    </section>
  );
};

export default ItemsCategory;
