// pages/api/confirm-payment.js (Next.js API route)
import PayPal from '@paypal/checkout-server-sdk';

// Cấu hình PayPal client
const paypalClient = new PayPal.core.PayPalHttpClient(
  new PayPal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { orderId, status, amount } = req.body;

    try {
      // Xác minh thanh toán với PayPal
      const request = new PayPal.orders.OrdersGetRequest(orderId);
      const order = await paypalClient.execute(request);

      // Kiểm tra tính hợp lệ của thanh toán
      if (
        order.result.status === 'COMPLETED' &&
        order.result.purchase_units[0].amount.value === amount.toString()
      ) {
        // Lưu thông tin thanh toán vào database
        await savePaymentToDatabase({
          orderId,
          amount,
          userId: req.user.id, // Giả sử bạn đã xác thực người dùng
          status: 'success'
        });

        // Cập nhật trạng thái dịch vụ cho người dùng
        await updateUserSubscription(req.user.id);

        res.status(200).json({
          success: true,
          message: 'Thanh toán thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Thanh toán không hợp lệ'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi xác minh thanh toán',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Các hàm hỗ trợ (giả định)
async function savePaymentToDatabase(paymentDetails) {
  // Logic lưu thông tin thanh toán vào cơ sở dữ liệu
}

async function updateUserSubscription(userId) {
  // Logic cập nhật trạng thái đăng ký của người dùng
}