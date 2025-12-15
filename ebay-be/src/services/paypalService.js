import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

class PayPalService {
  constructor() {
    this.environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  /**
   * Tạo đơn hàng trên PayPal
   */
  async createOrder(orderId, amount, orderDetails) {
    try {
      console.log('🔵 Creating PayPal order for:', { orderId, amount });
      console.log('PayPal Credentials:', {
        clientId: process.env.PAYPAL_CLIENT_ID?.substring(0, 20) + '...',
        mode: process.env.PAYPAL_MODE
      });

      // Calculate item total
      let itemTotal = 0;
      const items = orderDetails.items?.map(item => {
        const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity || 1);
        itemTotal += itemSubtotal;
        console.log(`  Item: ${item.name}, Qty: ${item.quantity}, Price: $${item.price}, Subtotal: $${itemSubtotal.toFixed(2)}`);
        return {
          name: item.name,
          quantity: (item.quantity || 1).toString(),
          unit_amount: {
            currency_code: 'USD',
            value: parseFloat(item.price).toFixed(2)
          }
        };
      }) || [];

      console.log(`📊 Item Total Calculated: $${itemTotal.toFixed(2)}`);
      console.log(`📊 Total Amount: $${amount.toFixed(2)}`);
      console.log(`📊 Shipping Cost: $${(amount - itemTotal).toFixed(2)}`);
      console.log(`📊 Items Count: ${items.length}`);

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId.toString(),
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: itemTotal.toFixed(2)
                },
                shipping: {
                  currency_code: 'USD',
                  value: (amount - itemTotal).toFixed(2)
                }
              }
            },
            description: `eBay Clone Order #${orderId}`,
            items: items
          }
        ],
        application_context: {
          brand_name: 'eBay Clone',
          locale: 'en-US',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/checkout/paypal/success`,
          cancel_url: `${process.env.FRONTEND_URL}/checkout/paypal/cancel`
        }
      });

      const response = await this.client.execute(request);

      console.log('✅ PayPal order created:', response.result.id);
      console.log('Status:', response.result.status);

      // Tìm approval link
      const approvalLink = response.result.links.find(
        link => link.rel === 'approve'
      );

      return {
        success: true,
        paypalOrderId: response.result.id,
        status: response.result.status,
        approveUrl: approvalLink?.href,
        createTime: response.result.create_time
      };
    } catch (error) {
      console.error('❌ PayPal Create Order Error:', error.message);
      if (error.statusCode) {
        console.error('Status Code:', error.statusCode);
      }
      if (error.details) {
        console.error('Details:', error.details);
      }
      return {
        success: false,
        message: error.message || 'Failed to create PayPal order'
      };
    }
  }

  /**
   * Capture thanh toán (lấy tiền)
   */
  async captureOrder(paypalOrderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});

      const response = await this.client.execute(request);

      if (response.result.status === 'COMPLETED') {
        const captureData = response.result.purchase_units[0].payments.captures[0];

        return {
          success: true,
          status: response.result.status,
          transactionId: captureData.id,
          amount: captureData.amount.value,
          currency: captureData.amount.currency_code,
          payer: {
            email: response.result.payer.email_address,
            name: `${response.result.payer.name.given_name} ${response.result.payer.name.surname}`,
            id: response.result.payer.payer_id
          },
          captureTime: captureData.create_time
        };
      } else {
        return {
          success: false,
          message: `Order status: ${response.result.status}`
        };
      }
    } catch (error) {
      console.error('PayPal Capture Order Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to capture PayPal order'
      };
    }
  }

  /**
   * Lấy chi tiết đơn hàng PayPal
   */
  async getOrderDetails(paypalOrderId) {
    try {
      const request = new paypal.orders.OrdersGetRequest(paypalOrderId);

      const response = await this.client.execute(request);

      return {
        success: true,
        orderId: response.result.id,
        status: response.result.status,
        payer: response.result.payer,
        purchaseUnits: response.result.purchase_units,
        createTime: response.result.create_time,
        updateTime: response.result.update_time
      };
    } catch (error) {
      console.error('PayPal Get Order Error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Refund (hoàn tiền)
   */
  async refundCapture(captureId, refundAmount = null) {
    try {
      const request = new paypal.payments.CapturesRefundRequest(captureId);

      if (refundAmount) {
        request.requestBody({
          amount: {
            value: refundAmount.toFixed(2),
            currency_code: 'USD'
          }
        });
      }

      const response = await this.client.execute(request);

      return {
        success: true,
        refundId: response.result.id,
        status: response.result.status,
        amount: response.result.amount
      };
    } catch (error) {
      console.error('PayPal Refund Error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new PayPalService();
