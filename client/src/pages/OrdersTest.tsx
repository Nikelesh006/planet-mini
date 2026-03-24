import { useState } from "react";

// This is a test component to create sample orders
export default function OrdersTest() {
  const [message, setMessage] = useState("");

  const createSampleOrder = async () => {
    try {
      const sampleOrder = {
        items: [
          {
            id: "1",
            name: "BMW S1000RR",
            price: 2999,
            quantity: 1,
            size: "M",
            color: "Blue",
            image: "https://res.cloudinary.com/dgcwiovzd/image/upload/v1773758261/products/ad5t0ahllztwzchujnyq.jpg",
            slug: "bmw-s1000rr"
          }
        ],
        totalAmount: 2999,
        shippingAddress: {
          street: "123 Test Street",
          city: "New York",
          state: "NY",
          pincode: "10001"
        },
        paymentMethod: "Credit Card",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber: "TRACK123456789"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(sampleOrder),
      });

      if (response.ok) {
        const order = await response.json();
        setMessage(`Sample order created: ${order.orderNumber}`);
      } else {
        setMessage("Failed to create order");
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders Test Page</h2>
        <p className="text-gray-600 mb-6">
          This page creates sample orders for testing the orders functionality.
        </p>
        <button
          onClick={createSampleOrder}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 w-full"
        >
          Create Sample Order
        </button>
        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}
        <div className="mt-6">
          <a href="/orders" className="text-primary hover:text-primary/80 font-medium">
            View Orders Page →
          </a>
        </div>
      </div>
    </div>
  );
}
