import { useState, useEffect } from 'react';
import { Eye, X, Package, MapPin, Calendar, CreditCard } from 'lucide-react';

interface OrderItem {
  productId?: {
    image: string;
    productName: string;
  };
  productName?: string;
  image?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              My Orders
            </h1>
            <p className="text-xl text-gray-600">Track your recent orders</p>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            {orders.length} Orders
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 
                                 flex items-center justify-center transition-all duration-200 
                                 group hover:bg-blue-600 active:scale-95"
                      title="View Order Details"
                    >
                      <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.productName || 'Product'} 
                        className="w-20 h-20 object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {item.productName || 'Unknown Product'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Size: {item.size || 'N/A'}</span>
                          <span>Color: {item.color || 'N/A'}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">₹{item.price}</p>
                        <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm text-gray-600">Shipping</p>
                      <p className="font-bold text-lg text-gray-900">Total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">₹{order.subtotal?.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">₹{order.shipping?.toLocaleString()}</p>
                      <p className="font-bold text-lg text-emerald-600">₹{order.total?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Start Shopping
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={closeOrderDetails}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Order Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-semibold">#{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-semibold">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-xl text-emerald-600">
                          ₹{selectedOrder.total?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-semibold">Cash on Delivery</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="px-4 py-2 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress?.street}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                    </p>
                    <p className="text-gray-600">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Products</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img 
                          src={item.image || '/placeholder.svg'} 
                          alt={item.productName || 'Product'} 
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {item.productName || 'Unknown Product'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Size: {item.size || 'N/A'}</span>
                            <span>Color: {item.color || 'N/A'}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">₹{item.price}</p>
                          <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
