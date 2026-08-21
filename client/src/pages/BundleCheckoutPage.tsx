import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useCustomBagBundle } from "@/contexts/CustomBagBundleContext";
import { useAuth } from "@/contexts/AuthContext";
import { Confetti, useConfetti } from "@/components/ui/Confetti";
import { ChevronDown, ArrowLeft, Minus, Plus, MapPin, Check, ShoppingBag, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { addressApi, Address } from '../utils/addressApi';
import { useRazorpay } from '@/hooks/useRazorpay';
import { apiFetch } from '@/lib/api';
import type { BundleItem } from "@/contexts/CustomBagBundleContext";

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

export default function BundleCheckoutPage() {
  const { bundleItems, bundleTotal, totalItems, removeFromBundle, updateQuantity, clearBundle } = useCustomBagBundle();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [, setLocation] = useLocation();
  const { showConfetti, triggerConfetti } = useConfetti();
  const { initializePayment, isLoading: isPaymentLoading, error: paymentError } = useRazorpay();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const isCompletingOrderRef = useRef(false);

  useEffect(() => {
    if (!orderSuccess) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      setLocation('/orders');
    }, 3000);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [orderSuccess, setLocation]);

  console.log('🔍 Bundle state:', { bundleItems, bundleTotal, totalItems });

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userAddresses = await addressApi.getAddresses();
        console.log('Fetched addresses:', userAddresses);
        setAddresses(userAddresses);

        // Restore selected address from localStorage or select first address
        const savedAddressId = localStorage.getItem('selectedAddressId');
        if (savedAddressId && userAddresses.find(addr => addr._id === savedAddressId)) {
          setSelectedAddressId(savedAddressId);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };

    fetchAddresses();
  }, []);

  const getSelectedAddress = () => {
    return addresses.find(addr => addr._id === selectedAddressId);
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate bundle has items
      if (bundleItems.length === 0) {
        alert('Your bundle is empty. Please add items before placing an order.');
        return;
      }

      // Validate user has addresses
      if (addresses.length === 0) {
        alert('Please add a shipping address before placing an order.');
        window.location.href = '/add-address';
        return;
      }

      // Get selected shipping address
      if (!selectedAddressId) {
        alert('Please select a shipping address before placing an order.');
        return;
      }

      const currentUserId = user?.id || user?.sub;
      const totalAmount = bundleTotal;

      // Step 1: Create Razorpay order
      const orderResponse = await apiFetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': currentUserId || ''
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { order_id } = await orderResponse.json();

      // Step 2: Prepare order data for after payment
      const selectedAddress = getSelectedAddress();
      const orderData = {
        items: bundleItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          image: item.product.image,
          price: item.product.sellingPrice,
          quantity: item.quantity,
          variant: item.variant || 'N/A'
        })),
        shippingAddress: selectedAddress ? {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        } : undefined,
        shippingAddressId: selectedAddressId,
        total: totalAmount,
        isBundle: true
      };

      // Step 3: Initialize Razorpay payment
      const paymentResponse = await initializePayment({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Planet Mini',
        description: `Payment for Custom Bundle (${totalItems} item(s))`,
        order_id: order_id,
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: getSelectedAddress()?.phone || ''
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
          }
        },
        handler: async (response) => {
          if (isCompletingOrderRef.current) {
            return;
          }

          isCompletingOrderRef.current = true;

          try {
            // Step 4: Verify payment and create order
            const verifyResponse = await apiFetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'x-user-id': currentUserId || ''
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();
            console.log('Order created successfully:', result);

            // Clear the bundle after successful order
            clearBundle();

            // Trigger confetti
            triggerConfetti();

            setOrderSuccess(true);

          } catch (error) {
            console.error('Error verifying payment:', error);
            isCompletingOrderRef.current = false;
            alert('Payment verification failed. Please contact support.');
          }
        }
      });

      console.log('Payment initialized:', paymentResponse);

    } catch (error) {
      console.error('Error placing order:', error);
      alert(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    }
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white px-4" role="status" aria-live="polite">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md rounded-3xl border border-[#b4c49a]/30 bg-white p-8 text-center shadow-2xl sm:p-10"
        >
          <motion.div
            initial={{ scale: 0.72 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#b4c49a]/15"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 16 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4f8f3a] shadow-lg shadow-[#4f8f3a]/20"
            >
              <Check className="h-9 w-9 text-white" strokeWidth={3.2} />
            </motion.div>
          </motion.div>

          <h1 className="text-2xl font-bold text-black sm:text-3xl">Order Placed Successfully!</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">Your order has been placed successfully.</p>

          <div className="mx-auto mt-7 h-1.5 w-36 overflow-hidden rounded-full bg-[#b4c49a]/20">
            <motion.div
              className="h-full rounded-full bg-[#4f8f3a]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>

        <Confetti trigger={showConfetti} />
      </div>
    );
  }

  if (bundleItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your bundle is empty</h2>
          <p className="text-gray-600 mb-4">Add items to your custom bundle to checkout</p>
          <Link href="/shop/style?custom=true">
            <button className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-20">
      {/* Confetti Animation */}
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop/style?custom=true">
              <button className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:font-medium">Back</span>
              </button>
            </Link>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Bundle Checkout</h1>
            <div className="w-16 sm:w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Bundle Items Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Your Custom Bundle ({totalItems} items)</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {bundleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    {/* Product Thumbnail */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                      <img
                        src={getCloudinaryImageUrl(item.product.image, "f_auto,q_100,w_200")}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:font-semibold text-gray-900 truncate">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-xs sm:text-sm text-gray-500">{item.variant}</p>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                        <span className="text-sm sm:font-bold text-gray-900">
                          &#8377;{(Number(item.product.sellingPrice || 0) * item.quantity).toFixed(0)}
                        </span>
                        <span className="text-xs sm:text-gray-500">
                          ×{item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromBundle(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Shipping Address</h2>
              
              {addresses.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-gray-600 mb-3 sm:mb-4">No shipping address added</p>
                  <Link href="/add-address">
                    <button className="bg-black text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base">
                      Add Address
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        localStorage.setItem('selectedAddressId', address._id);
                      }}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          selectedAddressId === address._id ? 'border-black' : 'border-gray-300'
                        }`}>
                          {selectedAddressId === address._id && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-black" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:font-semibold text-gray-900">{address.fullName}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{address.phone}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                            {address.street}, {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

            {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>&#8377;{bundleTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between font-bold text-gray-900 text-base sm:text-lg">
                    <span>Total</span>
                    <span>&#8377;{bundleTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPaymentLoading || addresses.length === 0}
                className="w-full bg-black text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {isPaymentLoading ? 'Processing...' : 'Place Order'}
              </button>

              {paymentError && (
                <p className="text-red-600 text-xs sm:text-sm mt-3 text-center">{paymentError}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
