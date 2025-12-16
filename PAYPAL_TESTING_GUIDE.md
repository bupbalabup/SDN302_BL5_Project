# 🧪 Hướng Dẫn Test PayPal - eBay Clone

## ⚠️ VẤN ĐỀ BẠN ĐANG GẶP

Bạn đang sử dụng **PayPal Sandbox** (môi trường test) nhưng cố gắng đăng nhập bằng **tài khoản PayPal thật** → **KHÔNG HOẠT ĐỘNG!**

## ✅ GIẢI PHÁP

### Bước 1: Tạo Tài Khoản Test PayPal Sandbox

1. Truy cập: https://developer.paypal.com/
2. Đăng nhập bằng tài khoản PayPal thật của bạn
3. Vào **Dashboard** → **Testing Tools** → **Sandbox Accounts**
4. Bạn sẽ thấy 2 tài khoản test được tạo sẵn:
   - **Business Account** (người bán - đã config trong .env)
   - **Personal Account** (người mua - dùng để test thanh toán)

### Bước 2: Lấy Thông Tin Đăng Nhập Test

1. Click vào **Personal Account** (tài khoản người mua)
2. Click **View/Edit Account**
3. Vào tab **Account Details**
4. Lưu lại:
   - **Email**: `sb-xxxxx@personal.example.com`
   - **Password**: (click "Show" để xem)

### Bước 3: Test Thanh Toán

1. Vào trang checkout trên website của bạn
2. Chọn phương thức **PayPal**
3. Click **Thanh Toán PayPal**
4. Bạn sẽ được redirect đến trang PayPal Sandbox
5. **QUAN TRỌNG**: Đăng nhập bằng **tài khoản Personal Sandbox** (không phải tài khoản thật!)
6. Xác nhận thanh toán
7. Bạn sẽ được redirect về `/checkout/paypal/success`

---

## 🔧 KIỂM TRA CẤU HÌNH

### File `.env` của bạn:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=AcKn3fcC0brygsyuTGQKJQhWY8XAOA1eD90CMkGqqUU_V7U-M0Bg9A-9cfeTVg9MRF6g6ergkfuaCMxe
PAYPAL_CLIENT_SECRET=EL5y4Hx0-c4OL6z3pukz5bxwWJbZymsp4OKcQ3GcWV-jyMUU-OTRBemP934gm7zNo__JYSt3pfha1NO-
PAYPAL_MODE=sandbox  ✅ ĐÚNG - Đang dùng sandbox
FRONTEND_URL=http://localhost:3000
```

**Cấu hình này ĐÚNG!** Bạn đang dùng Sandbox mode.

---

## 🎯 FLOW THANH TOÁN PAYPAL

```
1. User click "Thanh Toán PayPal"
   ↓
2. Frontend gọi: POST /api/payments/paypal/create-test
   ↓
3. Backend tạo PayPal Order → trả về approveUrl
   ↓
4. Frontend redirect user đến approveUrl (PayPal Sandbox)
   ↓
5. User đăng nhập PayPal SANDBOX và xác nhận
   ↓
6. PayPal redirect về: /checkout/paypal/success
   ↓
7. Frontend gọi: POST /api/payments/paypal/capture-test
   ↓
8. Backend capture payment → cập nhật order status
   ↓
9. Hiển thị "Thanh toán thành công!" ✅
```

---

## 🐛 DEBUG

### Kiểm tra logs trong Console:

**Frontend (Browser Console):**
```javascript
🔵 Token: eyJhbGciOiJIUzI1NiIsInR5...
🔵 OrderId: 693ea08a8638739a938b09e4
🔵 Create Response Status: 200
✅ PayPal Create Response: { success: true, data: { ... } }
```

**Backend (Terminal):**
```javascript
🔵 Creating PayPal order for: { orderId: '...', amount: 48.6 }
PayPal Credentials: { clientId: 'AcKn3fcC0brygsyuTGQK...', mode: 'sandbox' }
📊 Item Total Calculated: 45.00
📊 Total Amount: 48.60
📊 Shipping Cost: 3.60
✅ PayPal order created: 8XY12345AB678901C
Status: CREATED
```

---

## ❌ LỖI THƯỜNG GẶP

### 1. "Invalid credentials"
**Nguyên nhân**: Client ID hoặc Secret sai
**Giải pháp**: Kiểm tra lại credentials trong PayPal Developer Dashboard

### 2. "ITEM_TOTAL_MISMATCH"
**Nguyên nhân**: Tổng tiền items + shipping không khớp với total amount
**Giải pháp**: Đã fix trong code - tự động tính shipping = total - itemTotal

### 3. "Cannot login to PayPal"
**Nguyên nhân**: Đang dùng tài khoản PayPal thật thay vì Sandbox
**Giải pháp**: Dùng tài khoản Personal Sandbox (xem Bước 2)

### 4. "Payment not captured"
**Nguyên nhân**: Không có paymentId hoặc paypalOrderId trong sessionStorage
**Giải pháp**: Kiểm tra browser console, đảm bảo redirect đúng flow

---

## 🧪 TEST CASES

### Test Case 1: Thanh toán thành công
1. Tạo order với PayPal
2. Đăng nhập Sandbox account
3. Xác nhận thanh toán
4. Kiểm tra order status = "Processing"
5. Kiểm tra email xác nhận

### Test Case 2: Hủy thanh toán
1. Tạo order với PayPal
2. Click "Cancel" trên trang PayPal
3. Redirect về `/checkout/paypal/cancel`
4. Order status vẫn là "Processing"

### Test Case 3: Thanh toán thất bại
1. Dùng Sandbox account không đủ tiền
2. PayPal sẽ từ chối
3. Hiển thị lỗi

---

## 📱 TẠO TÀI KHOẢN SANDBOX MỚI (Nếu cần)

1. Vào https://developer.paypal.com/dashboard/accounts
2. Click **Create Account**
3. Chọn:
   - **Account Type**: Personal (Buyer Account)
   - **Email**: tự động generate
   - **Password**: tự đặt
   - **Balance**: $1000 (hoặc số tiền bạn muốn)
4. Click **Create Account**

---

## 🔐 BẢO MẬT

⚠️ **QUAN TRỌNG**: 
- File `.env` chứa credentials thật → **KHÔNG ĐƯỢC COMMIT LÊN GIT**
- Đã có trong `.gitignore` ✅
- Khi deploy production, đổi `PAYPAL_MODE=live` và dùng Live credentials

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:
1. Kiểm tra logs trong browser console (F12)
2. Kiểm tra logs trong terminal backend
3. Kiểm tra PayPal Developer Dashboard → Activity
4. Đảm bảo đang dùng tài khoản Sandbox, không phải tài khoản thật

---

## 🎉 KẾT LUẬN

Hệ thống PayPal của bạn **ĐÃ HOẠT ĐỘNG ĐÚNG**! 

Vấn đề duy nhất là bạn cần:
1. ✅ Tạo/lấy tài khoản PayPal Sandbox Personal
2. ✅ Đăng nhập bằng tài khoản Sandbox khi test
3. ✅ KHÔNG dùng tài khoản PayPal thật trong môi trường Sandbox

**Happy Testing! 🚀**
