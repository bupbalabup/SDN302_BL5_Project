# 📱 API Thanh Toán - eBay Clone

## Mô Tả
Module thanh toán mô phỏng hỗ trợ 2 phương thức thanh toán:
- **COD (Cash on Delivery)**: Thanh toán khi nhận hàng
- **PayPal**: Thanh toán trực tuyến mô phỏng

## Tính Năng Chính
✅ Xác thực token JWT  
✅ Kiểm tra security key  
✅ Thời gian xác nhận < 2 giây  
✅ Gửi email xác nhận thanh toán  
✅ Quản lý lịch sử thanh toán  
✅ Hủy thanh toán

---

## API Endpoints

### 1. Tạo Thanh Toán COD
**POST** `/api/payments/cod`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "693ea08a8638739a938b09e4"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thanh toán COD đã được xác nhận",
  "data": {
    "success": true,
    "payment": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "transactionId": "COD-1704069600000-a1b2c3d4",
      "status": "completed",
      "amount": 48.6,
      "paymentMethod": "COD",
      "message": "Thanh toán COD đã được xác nhận. Vui lòng thanh toán khi nhận hàng."
    },
    "processingTime": 150
  }
}
```

---

### 2. Tạo Thanh Toán PayPal
**POST** `/api/payments/paypal`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "693ea08a8638739a938b09e4"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thanh toán PayPal thành công",
  "data": {
    "success": true,
    "payment": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "transactionId": "PAYPAL-1704069600000-a1b2c3d4",
      "status": "completed",
      "amount": 48.6,
      "paymentMethod": "PayPal",
      "message": "Thanh toán PayPal thành công!"
    },
    "processingTime": 450
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "PayPal verification failed: Insufficient funds or card declined"
}
```

---

### 3. Lấy Lịch Sử Thanh Toán
**GET** `/api/payments/history?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "orderId": {
          "_id": "693ea08a8638739a938b09e4",
          "totalPrice": 48.6,
          "status": "Processing"
        },
        "buyerId": "65a1b2c3d4e5f6g7h8i9j0k2",
        "amount": 48.6,
        "paymentMethod": "COD",
        "status": "completed",
        "transactionId": "COD-1704069600000-a1b2c3d4",
        "confirmedAt": "2024-01-01T10:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

### 4. Lấy Thông Tin Thanh Toán
**GET** `/api/payments/:paymentId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": {
      "_id": "693ea08a8638739a938b09e4",
      "totalPrice": 48.6,
      "status": "Processing"
    },
    "buyerId": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "email": "user@example.com",
      "name": "Nguyễn Văn A"
    },
    "amount": 48.6,
    "paymentMethod": "COD",
    "status": "completed",
    "transactionId": "COD-1704069600000-a1b2c3d4",
    "confirmedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### 5. Xác Thực Thanh Toán
**POST** `/api/payments/verify`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "securityKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thanh toán đã được xác thực",
  "data": {
    "paymentId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "completed",
    "amount": 48.6,
    "paymentMethod": "COD"
  }
}
```

---

### 6. Hủy Thanh Toán
**PUT** `/api/payments/:paymentId/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Thanh toán đã bị hủy"
  }
}
```

---

## Bảo Mật

### Security Key
- Mỗi thanh toán có một **Security Key** duy nhất được tạo bằng `crypto.randomBytes(32)`
- Được lưu trữ an toàn trong database
- Sử dụng `crypto.timingSafeEqual()` để so sánh tránh timing attacks

### Token Authentication
- Tất cả endpoint yêu cầu JWT token hợp lệ
- Token được xác thực qua middleware `verifyToken`

### Validation
- Kiểm tra quyền sở hữu đơn hàng/thanh toán
- Kiểm tra số tiền khớp với đơn hàng
- Kiểm tra trạng thái đơn hàng hợp lệ

---

## Hiệu Năng

### Thời Gian Xác Nhận
- **COD**: < 500ms (xử lý tức thì)
- **PayPal**: 200-500ms (mô phỏng API call)
- **Yêu cầu**: Tất cả < 2 giây ✅

### Performance Metrics
```javascript
const processingTime = Date.now() - startTime;

if (processingTime > 2000) {
  console.warn(`Payment processing took ${processingTime}ms (> 2s)`);
}
```

---

## Trạng Thái Thanh Toán

| Trạng Thái | Mô Tả |
|-----------|-------|
| `pending` | Thanh toán đang chờ xử lý |
| `completed` | Thanh toán hoàn thành thành công |
| `failed` | Thanh toán thất bại |
| `cancelled` | Thanh toán bị hủy |

---

## Email Notifications

Khi thanh toán thành công, email xác nhận sẽ được gửi với thông tin:
- Mã đơn hàng
- Phương thức thanh toán
- Tổng tiền
- Danh sách sản phẩm
- Thời gian đặt hàng

---

## Test

### Test COD Payment
```bash
curl -X POST http://localhost:9999/api/payments/cod \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"693ea08a8638739a938b09e4"}'
```

### Test PayPal Payment
```bash
curl -X POST http://localhost:9999/api/payments/paypal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"693ea08a8638739a938b09e4"}'
```

---

## Cấu Hình Môi Trường

File `.env` cần có:
```
PORT=9999
MONGO_URI=mongodb://127.0.0.1:27017/
DB_NAME=ebay-clone
JWT_SECRET=your_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Liên Kết

- **Email Service**: [emailService.js](./emailService.js)
- **Payment Model**: [Payment.js](../models/Payment.js)
- **Order Model**: [Order.js](../models/Order.js)
