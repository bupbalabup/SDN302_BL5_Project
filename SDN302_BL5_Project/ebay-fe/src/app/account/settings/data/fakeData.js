// Fake data cho Notifications
export const fakeNotifications = {
  orders: [
    {
      id: 1,
      title: "Đơn hàng #12345 đã được giao",
      date: "2025-11-02",
      status: "delivered",
    },
    {
      id: 2,
      title: "Đơn hàng #12346 đang được xử lý",
      date: "2025-11-03",
      status: "processing",
    },
  ],
  promotions: [
    {
      id: 3,
      title: "🎉 Giảm giá 20% cho thành viên Premium",
      date: "2025-11-01",
    },
    {
      id: 4,
      title: "🛍️ Mua 2 tặng 1 – Chỉ trong hôm nay!",
      date: "2025-11-04",
    },
  ],
  feedback: [
    {
      id: 5,
      title: "Cảm ơn bạn đã đánh giá sản phẩm!",
      date: "2025-11-03",
    },
    {
      id: 6,
      title: "Bạn có muốn chia sẻ ý kiến về dịch vụ không?",
      date: "2025-11-04",
    },
  ],
};

// Fake data cho Coupons
export const fakeCoupons = [
  {
    id: 1,
    code: "SUMMER2025",
    title: "Giảm 50.000đ cho đơn hàng từ 500.000đ",
    discount: "50.000đ",
    minOrder: "500.000đ",
    expiry: "2025-12-31",
    status: "active",
    type: "fixed",
  },
  {
    id: 2,
    code: "FREESHIP100",
    title: "Miễn phí vận chuyển cho đơn từ 200.000đ",
    discount: "Free Ship",
    minOrder: "200.000đ",
    expiry: "2025-11-30",
    status: "active",
    type: "shipping",
  },
  {
    id: 3,
    code: "NEWUSER30",
    title: "Giảm 30% cho khách hàng mới",
    discount: "30%",
    minOrder: "0đ",
    expiry: "2025-11-15",
    status: "active",
    type: "percentage",
  },
  {
    id: 4,
    code: "BLACKFRIDAY",
    title: "Giảm 100.000đ cho đơn từ 1.000.000đ",
    discount: "100.000đ",
    minOrder: "1.000.000đ",
    expiry: "2025-10-31",
    status: "expired",
    type: "fixed",
  },
  {
    id: 5,
    code: "VIP20",
    title: "Giảm 20% dành cho thành viên VIP",
    discount: "20%",
    minOrder: "300.000đ",
    expiry: "2025-12-25",
    status: "active",
    type: "percentage",
  },
];