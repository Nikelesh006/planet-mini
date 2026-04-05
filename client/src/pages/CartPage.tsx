import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Confetti, useConfetti } from "@/components/ui/Confetti";
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addressApi, Address } from '../utils/addressApi';

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth(); // Move useAuth to top level
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [location] = useLocation();
  const [promoCode, setPromoCode] = useState('');
  const { showConfetti, triggerConfetti } = useConfetti();

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

      // Prepare order data
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
        total: state.totalPrice
      };

      // Send order to backend
      const token = localStorage.getItem('token');
      const currentUserId = user?.id || user?.sub;
      
      console.log('🔍 Placing order for user:', currentUserId);
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUserId || ''
        },
        body: JSON.stringify({
          ...orderData,
          userId: currentUserId // Include userId in order data
        })
      });

      console.log('REQUEST SENT - Status:', response.status);
      console.log('REQUEST SENT - OK:', response.ok);
      console.log('REQUEST HEADERS - Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        const order = await response.json();
        console.log('SUCCESS: Order response received:', JSON.stringify(order, null, 2));
        
        // Check if order has required fields
        if (!order.orderNumber) {
          console.error('RESPONSE VALIDATION FAILED: Missing orderNumber in response');
          console.error('Full response object:', order);
          alert('Order was created but missing order number. Please contact support.');
          return;
        }
        
        console.log('SUCCESS: Order has required fields - proceeding with cart clear');
        
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
        // Handle non-OK responses
        const responseText = await response.text();
        console.error('REQUEST FAILED: Response status:', response.status);
        console.error('REQUEST FAILED: Response text:', responseText);
        
        // Try to parse as JSON for better error handling
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          errorData = { message: responseText };
        }
        
        console.error('REQUEST FAILED: Parsed error:', JSON.stringify(errorData, null, 2));
        alert(`Failed to place order: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    }
  };

  const subtotal = state.totalPrice;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">Your Cart</h1>
          <span className="text-gray-500">{state.totalItems} Items</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="space-y-0">
              {state.items.map((item, index) => (
                <div key={getCartItemKey(item, index)} className="grid grid-cols-12 gap-4 py-6 border-b border-gray-100 items-center">
                  {/* Product Details */}
                  <div className="col-span-6 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-black">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' · '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 text-left"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    <span className="text-xl font-bold text-black">{formatPrice(item.price)}</span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-4 py-2 text-black hover:bg-primary/10 hover:border-primary transition-colors rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-black min-w-[40px] text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-4 py-2 text-black hover:bg-primary/10 hover:border-primary transition-colors rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 text-center">
                    <span className="text-xl font-bold text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-6">Order Summary</h2>
              
              {/* SELECT ADDRESS */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  SELECT ADDRESS
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
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl appearance-none bg-white text-black font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    {addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {address.street}, {address.city}, {address.state}, {address.pincode}
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
                  className="w-full bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  + Add New Address
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ITEMS {state.totalItems}</span>
                  <span className="text-xl font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="text-xl font-bold text-black">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
                <span className="text-2xl font-bold text-black">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      <Confetti trigger={showConfetti} />
    </div>
  );
}
