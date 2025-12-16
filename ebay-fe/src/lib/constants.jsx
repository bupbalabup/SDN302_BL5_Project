export const USD_TO_VND_RATE = 26300;

// Trọng lượng mặc định (kg) cho mỗi sản phẩm khi DB chưa có field weight
// Có thể điều chỉnh theo loại sản phẩm sau này.
export const DEFAULT_ITEM_WEIGHT_KG = 0.5;

/**
 * Tính phí ship theo công thức “gần rẻ – xa đắt dần – nặng đắt hơn”
 *
 * - Nếu không có tọa độ (distance ~ 0): tính phí nội tỉnh theo cân nặng
 * - Có tọa độ: áp dụng hệ số theo vùng (gần / trung bình / xa / rất xa)
 *
 * Giá trị trả về là USD, đã được làm tròn 2 chữ số.
 */
export function calculateShippingUSD(distanceKm = 0, options = {}) {
  const { weightKg = 0, minUSD, maxUSD } = options;

  const safeDistance = Math.max(0, Number(distanceKm) || 0);
  const safeWeight = Math.max(0, Number(weightKg) || 0);

  // ===== TRƯỜNG HỢP KHÔNG CÓ TỌA ĐỘ (distance ~ 0) =====
  // Giả sử giao nội tỉnh / nội thành: tính theo cân nặng là chính.
  if (safeDistance < 1) {
    // 0–1kg: 1.2 USD, sau đó mỗi kg thêm 0.4 USD
    const baseLocal = 1.2;
    const extraPerKg = 0.4;
    const extraWeight = Math.max(0, safeWeight - 1);
    const localShipping = baseLocal + extraPerKg * extraWeight;

    const minLocal = typeof minUSD === "number" ? minUSD : 0.8;
    const maxLocal = typeof maxUSD === "number" ? maxUSD : 25;

    const clamped = Math.max(
      minLocal,
      Math.min(maxLocal, localShipping || minLocal)
    );
    return Math.round(clamped * 100) / 100;
  }

  // ===== CÓ TỌA ĐỘ: CHIA VÙNG THEO KHOẢNG CÁCH =====
  // Vùng càng xa thì hệ số càng lớn.
  let zoneFactor = 1; // < 10km – rất gần
  if (safeDistance > 10 && safeDistance <= 30) {
    zoneFactor = 1.4; // 10–30km – trong vùng lân cận
  } else if (safeDistance > 30 && safeDistance <= 150) {
    zoneFactor = 1.8; // 30–150km – liên tỉnh gần
  } else if (safeDistance > 150 && safeDistance <= 700) {
    zoneFactor = 2.4; // 150–700km – liên tỉnh xa
  } else if (safeDistance > 700) {
    zoneFactor = 3.0; // >700km – rất xa
  }

  // Phí cố định theo vùng (gửi hàng, xử lý…)
  const baseUSD = 0.9 * zoneFactor;

  // Phí theo km – khoảng cách xa ảnh hưởng nhiều hơn ở vùng xa
  const ratePerKmUSD = 0.03 * zoneFactor; // 0.03 USD / km * hệ số vùng

  // Phí theo cân nặng – mỗi kg làm tăng giá theo hệ số vùng
  const perKgUSD = 0.45 * zoneFactor; // 0.45 USD / kg * hệ số vùng

  const byDistance = ratePerKmUSD * safeDistance;
  const byWeight = perKgUSD * safeWeight;

  let shipping = baseUSD + byDistance + byWeight;

  // Ngưỡng tối thiểu / tối đa để tránh giá quá thấp hoặc quá cao
  const effectiveMin =
    typeof minUSD === "number" && Number.isFinite(minUSD) ? minUSD : 1.2;
  const effectiveMax =
    typeof maxUSD === "number" && Number.isFinite(maxUSD) ? maxUSD : 60;

  shipping = Math.max(effectiveMin, Math.min(effectiveMax, shipping));

  return Math.round(shipping * 100) / 100;
}

export function calculateOrderTotalUSD(
  items = [],
  distanceKm = 0,
  options = {}
) {
  const { discountPercent = 0, discountFlatUSD = 0 } = options;

  const subtotal = items.reduce((s, it) => {
    const price = it.priceUSD ?? it.price ?? 0;
    const qty = it.quantity ?? it.qty ?? 1;
    return s + price * qty;
  }, 0);

  const totalWeight = items.reduce(
    (s, it) => s + (it.weightKg ?? 0) * (it.quantity ?? 1),
    0
  );

  const shippingUSD = calculateShippingUSD(distanceKm, {
    ...options,
    weightKg: totalWeight,
  });

  const pct = Math.max(0, Math.min(100, discountPercent));
  const discountFromPercent = subtotal * (pct / 100);
  const discountUSD = Math.max(0, discountFromPercent + (discountFlatUSD || 0));

  const totalUSD =
    Math.round((subtotal - discountUSD + shippingUSD) * 100) / 100;

  return {
    subtotalUSD: Math.round(subtotal * 100) / 100,
    shippingUSD,
    discountUSD: Math.round(discountUSD * 100) / 100,
    totalUSD,
    subtotalVND: Math.round(subtotal * USD_TO_VND_RATE),
    shippingVND: Math.round(shippingUSD * USD_TO_VND_RATE),
    discountVND: Math.round(discountUSD * USD_TO_VND_RATE),
    totalVND: Math.round(totalUSD * USD_TO_VND_RATE),
  };
}
