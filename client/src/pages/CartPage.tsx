import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Confetti, useConfetti } from "@/components/ui/Confetti";
import { ChevronDown, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addressApi, Address } from '../utils/addressApi';
import { useRazorpay } from '@/hooks/useRazorpay';
import { apiFetch } from '@/lib/api';

export default function CartPage() {
  const { state, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { user } = useAuth(); // Move useAuth to top level
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [location] = useLocation();
  const [promoCode, setPromoCode] = useState('');
  const { showConfetti, triggerConfetti } = useConfetti();
  const { initializePayment, isLoading: isPaymentLoading, error: paymentError } = useRazorpay();

  console.log('🔍 Cart state:', state);
  console.log('🔍 Cart items:', state.items);

  // Fetch addresses on component mount and when location changes
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userAddresses = await addressApi.getAddresses();
        console.log('Fetched addresses:', userAddresses);
        setAddresses(userAddresses);
        
        // Check if we just returned from adding a new address
        const justAddedAddress = localStorage.getItem('justAddedAddress');
        
        // Restore selected address from localStorage or select first address
        const savedAddressId = localStorage.getItem('selectedAddressId');
        if (justAddedAddress && userAddresses.length > 0) {
          // Select the most recently added address
          const mostRecentAddress = userAddresses[userAddresses.length - 1];
          setSelectedAddressId(mostRecentAddress._id);
          localStorage.setItem('selectedAddressId', mostRecentAddress._id);
          localStorage.removeItem('justAddedAddress'); // Clear the flag
          console.log('Selected newly added address:', mostRecentAddress);
        } else if (savedAddressId && userAddresses.find(addr => addr._id === savedAddressId)) {
          setSelectedAddressId(savedAddressId);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [location]); // Refetch when location changes

  // Create a unique key for cart items
  const getCartItemKey = (item: any, index: number) => {
    // Use a combination of product id, size, color, and index to ensure uniqueness
    const sizeColor = item.size ? `-${item.size}` : '';
    const color = item.color ? `-${item.color}` : '';
    const uniqueKey = `${item.id}${sizeColor}${color}-${index}`;
    console.log(`🔍 Cart item key for ${item.name}: ${uniqueKey}`);
    return uniqueKey;
  };

  // Save selected address to localStorage when it changes
  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem('selectedAddressId', selectedAddressId);
    }
  }, [selectedAddressId]);

  const handleAddressChange = (value: string) => {
    console.log('Address change triggered:', value);
    if (value === 'NEW') {
      console.log('Redirecting to add-address...');
      // Force navigation with timeout
      setTimeout(() => {
        window.location.href = '/add-address';
      }, 100);
    } else {
      setSelectedAddressId(value);
    }
  };

  const getSelectedAddress = (): Address | undefined => {
    return addresses.find(addr => addr._id === selectedAddressId);
  };

  const formatPrice = (price: number) => {
    return `₹${price}`;
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate cart has items
      if (state.items.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
      }

      // Validate user has addresses
      if (addresses.length === 0) {
        alert('Please add a shipping address before placing an order.');
        window.location.href = '/add-address';
        return;
      }

      // Get selected shipping address
      const selectedAddressId = localStorage.getItem('selectedAddressId');
      if (!selectedAddressId) {
        alert('Please select a shipping address before placing an order.');
        return;
      }

      const currentUserId = user?.id || user?.sub;
      const totalAmount = subtotal;

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
      const orderData = {
        items: state.items.map(item => ({
          productId: item.id,
          productName: item.name,
          image: item.image,
          price: item.price,
          size: item.size || 'N/A',
          color: item.color || 'N/A',
          quantity: item.quantity
        })),
        shippingAddressId: selectedAddressId,
        total: totalAmount
      };

      // Step 3: Initialize Razorpay payment
      const paymentResponse = await initializePayment({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Planet Mini',
        description: `Payment for ${state.totalItems} item(s)`,
        order_id: order_id,
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: getSelectedAddress()?.phone || ''
        },
        handler: async (response) => {
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
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              const verifyResult = await verifyResponse.json();
              console.log('Payment verified:', verifyResult);

              // Create actual order after successful payment
              const orderResponse = await apiFetch('/api/orders', {
                method: 'POST',
                headers: {
                  'x-user-id': currentUserId || ''
                },
                body: JSON.stringify({
                  ...orderData,
                  userId: currentUserId,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  status: 'completed'
                })
              });

              if (orderResponse.ok) {
                const order = await orderResponse.json();
                console.log('Order created:', order);

                // Clear cart
                clearCart();
                
                // Trigger confetti animation
                triggerConfetti();
                
                // Show success message
                console.log(`Order placed successfully! Order Number: ${order.orderNumber}`);
                
                // Redirect to orders page
                setTimeout(() => {
                  window.location.href = '/profile/orders';
                }, 2000);
              } else {
                throw new Error('Failed to create order after payment');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error after payment:', error);
            alert('Payment successful but order creation failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          }
        }
      });

      if (!paymentResponse) {
        throw new Error('Payment initialization failed');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const subtotal = state.totalPrice;
  const total = subtotal;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <p className="text-gray-500 mb-8">Your cart is currently empty</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="cart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-black">Your Cart</h1>
          <span className="text-sm sm:text-base text-gray-500">{state.totalItems} Items</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2">
            {/* Table Header - Desktop Only */}
            <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {state.items.map((item, index) => (
                <div key={getCartItemKey(item, index)} className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 lg:grid lg:grid-cols-12 lg:gap-4 lg:border-b lg:rounded-none lg:border-t-0 lg:border-x-0 items-center">
                  {/* Product Details */}
                  <div className="flex gap-4 mb-4 lg:mb-0 lg:col-span-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex flex-col justify-center flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-black">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' · '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 text-left"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Mobile Price & Quantity Row */}
                  <div className="flex items-center justify-between lg:hidden">
                    <span className="text-lg font-bold text-black">{formatPrice(item.price)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-semibold text-black">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden lg:block lg:col-span-2 lg:text-center">
                    <span className="text-xl font-bold text-black">{formatPrice(item.price)}</span>
                  </div>

                  {/* Desktop Quantity Controls */}
                  <div className="hidden lg:flex lg:col-span-2 lg:items-center lg:justify-center lg:gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-10 text-center font-semibold text-black">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Mobile Subtotal */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 lg:hidden">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-lg font-bold text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>

                  {/* Desktop Subtotal */}
                  <div className="hidden lg:block lg:col-span-2 lg:text-center">
                    <span className="text-xl font-bold text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 sm:px-4 sm:py-2 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">Order Summary</h2>
              
              {/* SELECT ADDRESS */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Shipping Address
                </label>
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => {
                      console.log('Select onChange triggered, value:', e.target.value);
                      handleAddressChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      console.log('Select onBlur triggered, value:', e.target.value);
                      if (e.target.value === 'NEW') {
                        handleAddressChange('NEW');
                      }
                    }}
                    onClick={(e) => {
                      console.log('Select clicked');
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 border-2 border-gray-200 rounded-xl appearance-none bg-white text-black font-semibold focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 cursor-pointer text-sm sm:text-base"
                  >
                    {addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {address.fullName} - {address.phone} | {address.street}, {address.city}, {address.state}, {address.pincode}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Add New Address Button */}
              <div className="mb-4">
                <button 
                  onClick={() => {
                    console.log('Add New Address button clicked');
                    window.location.href = '/add-address';
                  }}
                  className="w-full bg-black text-white px-4 py-2 sm:px-4 sm:py-2 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  + Add New Address
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ITEMS ({state.totalItems})</span>
                  <span className="text-lg sm:text-xl font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="text-lg sm:text-xl font-bold text-black">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
                <span className="text-xl sm:text-2xl font-bold text-black">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-black">{formatPrice(subtotal)}</span>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isPaymentLoading}
                className="w-full bg-black text-white px-4 py-3 sm:px-6 sm:py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPaymentLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Payment Error Display */}
              {paymentError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{paymentError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      <Confetti trigger={showConfetti} />
    </motion.div>
  );
}
