import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalPaymentButton = () => {
  console.log('PayPal Client ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture", // Thêm intent
    // Thêm các tham số bắt buộc
    components: "buttons",
    'enable-funding': 'venmo', // Tùy chọn hỗ trợ thêm các phương thức thanh toán
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: "10.00" // Giá trị cố định để test
              }
            }]
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert("Transaction completed by " + details.payer.name.given_name);
          });
        }}
        onError={(err) => {
          console.error("PayPal Payment Error", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default function PaymentPage() {
  return (
    <div>
      <h1>Thanh toán</h1>
      <PayPalPaymentButton />
    </div>
  );
}