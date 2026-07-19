import { motion } from "framer-motion";

import { Link, useLocation } from "wouter";

import { useCart } from "@/contexts/CartContext";

import { useAuth } from "@/contexts/AuthContext";

import { Confetti, useConfetti } from "@/components/ui/Confetti";

import { ChevronDown, ArrowLeft, Minus, Plus, MapPin, Check, ShoppingBag } from 'lucide-react';

import { useState, useEffect } from 'react';

import { addressApi, Address } from '../utils/addressApi';

import { useRazorpay } from '@/hooks/useRazorpay';

import { apiFetch } from '@/lib/api';

import { getAvailableStock, isOutOfStock } from '@shared/stock';



export default function CartPage() {

  const { state, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

  const { user } = useAuth(); // Move useAuth to top level

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [location] = useLocation();

  const [promoCode, setPromoCode] = useState('');

  const { showConfetti, triggerConfetti } = useConfetti();

  const { initializePayment, isLoading: isPaymentLoading, error: paymentError } = useRazorpay();

  const [showAddressDropdown, setShowAddressDropdown] = useState(false);



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



  const formatPrice = (sellingPrice: number) => {

    return `₹${Math.round(Number(sellingPrice || 0)).toLocaleString('en-IN')}`;

  };



  const hasStockIssue = (item: any) =>

    isOutOfStock(item) || Number(item.quantity || 0) > getAvailableStock(item);



  const hasStockIssues = state.items.some(hasStockIssue);



  const handlePlaceOrder = async () => {

    try {

      // Validate cart has items

      if (state.items.length === 0) {

        alert('Your cart is empty. Please add items before placing an order.');

        return;

      }



      if (hasStockIssues) {

        alert('Some cart items are out of stock or exceed available stock. Please remove or adjust them before checkout.');

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

      const selectedAddress = getSelectedAddress();

      const orderData = {

        items: state.items.map(item => ({

          productId: item.id,

          productName: item.name,

          image: item.image,

          price: item.sellingPrice,

          size: item.size || 'N/A',

          color: item.color || 'N/A',

          quantity: item.quantity

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

                  status: 'completed',

                  paymentStatus: 'paid'

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

      <div className="min-h-screen bg-white pt-20 sm:pt-24" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">

          <div className="text-center max-w-md mx-auto">

            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-2" style={{ backgroundColor: 'rgba(180, 196, 154, 0.15)', borderColor: 'rgba(180, 196, 154, 0.3)' }}>

              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: '#b4c49a' }} />

            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4">Your Cart is Empty</h1>

            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-lg">Looks like you haven't added anything to your cart yet.</p>

            <Link 

              href="/"

              className="inline-flex items-center gap-2 sm:gap-3 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:opacity-90 text-sm sm:text-base"

              style={{ backgroundColor: '#b4c49a' }}

            >

              Start Shopping

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

      className="min-h-screen bg-white pt-20 sm:pt-24"

    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-6 sm:mb-8">

          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-black">Your Cart</h1>

          <span className="text-xs sm:text-sm lg:text-base text-gray-500">{state.totalItems} Items</span>

        </div>



        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart Items - Left Side */}

          <div className="lg:col-span-2">

            {/* Hospital Bag Section */}

            {state.items.some(item => item.category === 'home' && item.subcategory?.toLowerCase().includes('hospital')) && (

              <div className="mb-6 bg-gradient-to-r from-[#b4c49a]/5 to-[#b4c49a]/10 border-2 border-[#b4c49a]/30 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#b4c49a' }}>

                    <ShoppingBag className="w-6 h-6 text-white" />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">Hospital Bag Bundle</h2>

                    <p className="text-sm text-gray-600">Your custom hospital bag items</p>

                  </div>

                </div>

                

                <div className="space-y-3">

                  {state.items

                    .filter(item => item.category === 'home' && item.subcategory?.toLowerCase().includes('hospital'))

                    .map((item, index) => (

                      <div key={`hospital-${getCartItemKey(item, index)}`} className="bg-white rounded-xl p-4 border border-[#b4c49a]/20 shadow-sm">

                        <div className="flex gap-4">

                          <img

                            src={item.image}

                            alt={item.name}

                            crossOrigin="anonymous"

                            className="w-16 h-16 object-cover rounded-lg"

                          />

                          <div className="flex-1">

                            <h3 className="font-semibold text-gray-900">{item.name}</h3>

                            <div className="flex items-center justify-between mt-2">

                              <span className="text-sm font-bold text-gray-900">{formatPrice(item.sellingPrice)}</span>

                              <button

                                onClick={() => removeFromCart(item.id)}

                                className="text-sm text-red-500 hover:text-red-700 font-medium"

                              >

                                Remove

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                </div>

              </div>

            )}

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

                <div key={getCartItemKey(item, index)} className={`bg-white border rounded-2xl p-4 lg:p-6 lg:grid lg:grid-cols-12 lg:gap-4 lg:border-b lg:rounded-none lg:border-t-0 lg:border-x-0 items-center ${hasStockIssue(item) ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>

                  {/* Product Details */}

                  <div className="flex gap-4 mb-4 lg:mb-0 lg:col-span-6">

                    <img

                      src={item.image}

                      alt={item.name}

                      crossOrigin="anonymous"

                      className="w-16 h-16 sm:w-20 sm:h-24 object-cover rounded-xl shadow-md"

                    />

                    <div className="flex flex-col justify-center flex-1">

                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black">{item.name}</h3>

                      <p className="text-sm text-gray-600 mb-2">

                        {item.size && `Size: ${item.size}`}

                        {item.size && item.color && ' · '}

                        {item.color && `Color: ${item.color}`}

                      </p>

                      {hasStockIssue(item) && (

                        <p className="mb-2 text-sm font-medium text-red-600">

                          {isOutOfStock(item)

                            ? "This product is currently unavailable."

                            : `Only ${getAvailableStock(item)} available. Please reduce quantity.`}

                        </p>

                      )}

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

                    <span className="text-base font-semibold text-black">{formatPrice(item.sellingPrice)}</span>

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

                        disabled={isOutOfStock(item) || item.quantity >= getAvailableStock(item)}

                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                        aria-label="Increase quantity"

                      >

                        <Plus className="w-4 h-4 text-gray-600" />

                      </button>

                    </div>

                  </div>



                  {/* Desktop Price */}

                  <div className="hidden lg:block lg:col-span-2 lg:text-center">

                    <span className="text-base font-semibold text-black">{formatPrice(item.sellingPrice)}</span>

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

                      disabled={isOutOfStock(item) || item.quantity >= getAvailableStock(item)}

                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                      aria-label="Increase quantity"

                    >

                      <Plus className="w-4 h-4 text-gray-600" />

                    </button>

                  </div>



                  {/* Mobile Subtotal */}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 lg:hidden">

                    <span className="text-gray-600">Subtotal</span>

                    <span className="text-base font-semibold text-black">{formatPrice(item.sellingPrice * item.quantity)}</span>

                  </div>



                  {/* Desktop Subtotal */}

                  <div className="hidden lg:block lg:col-span-2 lg:text-center">

                    <span className="text-base font-semibold text-black">{formatPrice(item.sellingPrice * item.quantity)}</span>

                  </div>

                </div>

              ))}

            </div>



            {/* Continue Shopping */}

            <div className="mt-6">

              <Link 

                href="/"

                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 sm:px-4 sm:py-2 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"

              >

                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />

                Continue Shopping

              </Link>

            </div>

          </div>



          {/* Order Summary - Right Side */}

          <div className="lg:col-span-1">

            <div className="bg-gray-50 rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 lg:sticky lg:top-24">

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6">Order Summary</h2>

              

              {/* SHIPPING ADDRESS */}

              <div className="mb-6 relative">

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">

                    Shipping Address

                  </label>

                  {addresses.length > 0 && (

                    <button

                      onClick={() => setShowAddressDropdown(!showAddressDropdown)}

                      className="text-xs font-bold text-[#b4c49a] hover:text-[#a0b088] flex items-center gap-0.5 transition-colors"

                    >

                      {showAddressDropdown ? 'Close' : 'Change'}

                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAddressDropdown ? 'rotate-180' : ''}`} />

                    </button>

                  )}

                </div>



                {addresses.length === 0 ? (

                  <div 

                    onClick={() => window.location.href = '/add-address'}

                    className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center bg-white hover:border-black hover:bg-gray-50/50 transition-all cursor-pointer group"

                  >

                    <MapPin className="w-8 h-8 text-gray-400 group-hover:text-black mx-auto mb-2 transition-colors" />

                    <span className="block text-sm font-bold text-black mb-1">No Shipping Address</span>

                    <span className="block text-[11px] text-gray-500 mb-3">Add a shipping address to complete your checkout</span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b4c49a] bg-[#b4c49a]/10 px-3 py-1.5 rounded-xl group-hover:bg-[#b4c49a]/20 transition-colors">

                      <Plus className="w-3.5 h-3.5" /> Add Address

                    </span>

                  </div>

                ) : (

                  <>

                    {/* Selected Address Card */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">

                      {getSelectedAddress() ? (

                        <div className="flex items-start gap-3">

                          <div className="bg-[#b4c49a]/10 p-2 rounded-xl text-[#b4c49a] mt-0.5 shrink-0">

                            <MapPin className="w-4 h-4" />

                          </div>

                          <div className="flex-1 min-w-0">

                            <h4 className="font-bold text-black text-sm truncate">

                              {getSelectedAddress()?.fullName}

                            </h4>

                            <p className="text-xs text-gray-500 mt-0.5 font-medium">

                              {getSelectedAddress()?.phone}

                            </p>

                            <p className="text-xs text-gray-600 mt-2 leading-relaxed">

                              {getSelectedAddress()?.street}, {getSelectedAddress()?.city}, {getSelectedAddress()?.state} - {getSelectedAddress()?.pincode}

                            </p>

                          </div>

                        </div>

                      ) : (

                        <p className="text-xs text-gray-500">Loading selected address...</p>

                      )}

                    </div>



                    {/* Custom Address Dropdown */}

                    {showAddressDropdown && (

                      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto p-2 space-y-1">

                        {addresses.map((address) => {

                          const isSelected = address._id === selectedAddressId;

                          return (

                            <div

                              key={address._id}

                              onClick={() => {

                                setSelectedAddressId(address._id);

                                setShowAddressDropdown(false);

                              }}

                              className={`p-3 rounded-xl cursor-pointer transition-colors text-left flex items-start justify-between gap-3 border ${

                                isSelected 

                                  ? 'bg-[#b4c49a]/10 border-[#b4c49a]/30 text-black' 

                                  : 'hover:bg-gray-50 border-transparent text-gray-700'

                              }`}

                            >

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                  <span className="text-xs font-bold truncate">

                                    {address.fullName}

                                  </span>

                                  <span className="text-[10px] text-gray-500 font-medium font-mono shrink-0">

                                    {address.phone}

                                  </span>

                                </div>

                                <p className="text-[11px] text-gray-500 truncate mt-1">

                                  {address.street}, {address.city}, {address.state}

                                </p>

                              </div>

                              {isSelected && (

                                <Check className="w-4 h-4 text-[#b4c49a] shrink-0 mt-0.5" />

                              )}

                            </div>

                          );

                        })}

                        <div 

                          onClick={() => window.location.href = '/add-address'}

                          className="p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-left border-t border-gray-100 flex items-center gap-2 text-[#b4c49a] hover:text-[#a0b088] font-semibold text-xs mt-1"

                        >

                          <Plus className="w-3.5 h-3.5" /> Add New Address

                        </div>

                      </div>

                    )}

                  </>

                )}

              </div>



              {/* Price Breakdown */}

              <div className="space-y-3 mb-6">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">ITEMS ({state.totalItems})</span>

                  <span className="text-base font-semibold text-black">{formatPrice(subtotal)}</span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Shipping Fee</span>

                  <span className="text-base font-semibold text-black">Free</span>

                </div>

              </div>



              {/* Total */}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">

                <span className="text-base sm:text-lg lg:text-xl font-bold text-black">Total</span>

                <span className="text-base sm:text-lg lg:text-xl font-bold text-black">{formatPrice(subtotal)}</span>

              </div>



              {hasStockIssues && (

                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">

                  <p className="text-sm font-medium text-red-700">

                    Remove out-of-stock items or reduce quantities before checkout.

                  </p>

                </div>

              )}



              {/* Place Order Button */}

              <button 

                onClick={handlePlaceOrder}

                disabled={isPaymentLoading || hasStockIssues}

                className="w-full bg-black text-white px-4 py-3 sm:px-6 sm:py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"

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

