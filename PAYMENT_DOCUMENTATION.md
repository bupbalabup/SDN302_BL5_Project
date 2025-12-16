# 💳 Payment System Documentation

## 📋 Overview
Hệ thống thanh toán hỗ trợ 2 phương thức:
- **COD (Cash on Delivery)**: Thanh toán khi nhận hàng
- **PayPal**: Thanh toán online (Giả lập)

---

## 🏗️ Architecture

### Models
- **Payment Model** (`src/models/Payment.js`)
  - `orderId`: Reference đến Order
  - `userId`: Reference đến User
  - `amount`: Số tiền thanh toán
  - `method`: COD hoặc PayPal
  - `status`: pending, completed, failed, cancelled
  - `transactionId`: ID từ PayPal
  - `paymentDetails`: Thông tin chi tiết thanh toán
  - `paidAt`: Thời gian thanh toán
  - `failureReason`: Lý do thất bại

### Services
- **PaymentService** (`src/services/paymentService.js`)
  - `processCODPayment()`: Tạo payment COD
  - `initiatePayPalPayment()`: Khởi tạo thanh toán PayPal
  - `completePayPalPayment()`: Hoàn tất PayPal payment
  - `confirmCODPayment()`: Xác nhận COD khi giao hàng
  - `getPaymentByOrderId()`: Lấy payment info
  - `getPaymentsByUserId()`: Lấy danh sách payment của user
  - `cancelPayment()`: Hủy thanh toán
  - `refundPayment()`: Hoàn tiền

### Controllers
- **PaymentController** (`src/controllers/paymentController.js`)
  - API endpoints handler

### Routes
- **PaymentRoutes** (`src/routes/paymentRoutes.js`)

---

## 🔌 API Endpoints

### 1. COD Payment

#### Create COD Payment
```http
POST /api/payments/cod
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "66a1b2c3d4e5f6g7h8i9j0k1",
  "userId": "65f1a2c3d4e5f6g7h8i9j0k1"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "COD payment created successfully",
  "payment": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "orderId": "66a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65f1a2c3d4e5f6g7h8i9j0k1",
    "amount": 500000,
    "method": "COD",
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

#### Confirm COD Payment (After Delivery)
```http
POST /api/payments/cod/confirm/{orderId}
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "COD payment confirmed",
  "payment": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "status": "completed",
    "paidAt": "2025-01-15T14:30:00Z"
  }
}
```

---

### 2. PayPal Payment

#### Initiate PayPal Payment
```http
POST /api/payments/paypal/init
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "66a1b2c3d4e5f6g7h8i9j0k1",
  "userId": "65f1a2c3d4e5f6g7h8i9j0k1",
  "returnUrl": "http://localhost:3000/payment/success"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "PayPal payment initiated",
  "paymentId": "67a1b2c3d4e5f6g7h8i9j0k3",
  "transactionId": "PAYPAL_1705314600000_abc123xyz",
  "approvalUrl": "http://localhost:3001/api/payments/paypal/callback?transactionId=PAYPAL_1705314600000_abc123xyz&amount=500000"
}
```

**Flow:**
1. Frontend nhận `approvalUrl`
2. Redirect user tới URL này
3. User xác nhận thanh toán
4. PayPal redirect về callback

#### PayPal Callback (Simulate)
```http
GET /api/payments/paypal/callback?transactionId=PAYPAL_1705314600000_abc123xyz&payerEmail=user@example.com
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "PayPal payment completed successfully",
  "payment": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k3",
    "transactionId": "PAYPAL_1705314600000_abc123xyz",
    "status": "completed",
    "paidAt": "2025-01-15T10:35:00Z"
  }
}
```

---

### 3. Get Payment Info

#### Get Payment by Order ID
```http
GET /api/payments/order/{orderId}
Authorization: Bearer {token}
```

#### Get User Payments
```http
GET /api/payments/user/{userId}?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
        "orderId": { "_id": "66a1b2c3d4e5f6g7h8i9j0k1", "totalPrice": 500000 },
        "method": "COD",
        "amount": 500000,
        "status": "completed",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

### 4. Payment Actions

#### Cancel Payment
```http
POST /api/payments/cancel/{paymentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "User changed mind"
}
```

#### Refund Payment
```http
POST /api/payments/refund/{paymentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Product defective"
}
```

---

## 🔄 Payment Flow

### COD Flow
```
User selects COD
    ↓
Create Order
    ↓
Create Payment (status: pending) → POST /api/payments/cod
    ↓
Order status: Processing
    ↓
Order Shipped
    ↓
Order Delivered
    ↓
Confirm Payment (status: completed) → POST /api/payments/cod/confirm
    ↓
Payment Complete ✓
```

### PayPal Flow
```
User selects PayPal
    ↓
Create Order
    ↓
Initiate Payment → POST /api/payments/paypal/init
    ↓
Redirect to PayPal approval page
    ↓
User confirms payment on PayPal
    ↓
PayPal redirects to callback → GET /api/payments/paypal/callback
    ↓
Payment status: completed
    ↓
Order status: Processing ✓
```

---

## 📊 Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Thanh toán chưa hoàn tất |
| `completed` | Thanh toán thành công |
| `failed` | Thanh toán thất bại |
| `cancelled` | Thanh toán bị hủy |

---

## 🛡️ Security Features

1. **Authentication Required**: Tất cả endpoints (ngoài callback) yêu cầu JWT token
2. **User Verification**: Kiểm tra user ID có phù hợp với payment
3. **Idempotency**: Không tạo duplicate payments cho một order
4. **Transaction ID**: Unique ID cho mỗi PayPal transaction

---

## 🧪 Testing with Postman

1. Import `payment_api_collection.json` vào Postman
2. Cập nhật token trong header
3. Thay đổi IDs (orderId, userId, paymentId)
4. Test từng endpoint

---

## 🚀 Future Enhancements

- [ ] Real PayPal API integration
- [ ] Stripe payment support
- [ ] Payment retry logic
- [ ] Webhook handling
- [ ] Payment notifications
- [ ] Refund automation
- [ ] Invoice generation
- [ ] Payment analytics dashboard

---

## 📝 Notes

- **COD Payment**: Status chuyển thành `completed` sau khi xác nhận từ shipper
- **PayPal Payment**: Giả lập callback, trong thực tế sẽ từ PayPal servers
- **Timestamps**: Được tự động cập nhật bởi MongoDB
- **Error Handling**: Tất cả errors được wrap trong try-catch

