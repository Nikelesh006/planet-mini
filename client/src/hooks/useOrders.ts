import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 2999,
        items: [
          {
            id: '1',
            name: 'Premium Cotton T-Shirt',
            price: 999,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
            size: 'L',
            color: 'Blue'
          },
          {
            id: '2',
            name: 'Classic Denim Jeans',
            price: 1999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
            size: '32',
            color: 'Blue'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 98765 43210',
          email: 'john.doe@example.com',
          address: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        paymentMethod: 'Credit Card',
        trackingNumber: 'TRK123456789'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: '2024-01-20',
        status: 'shipped',
        total: 1499,
        items: [
          {
            id: '3',
            name: 'Summer Dress',
            price: 1499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1515372039734-b8f14a71ed38?w=300&h=300&fit=crop',
            size: 'M',
            color: 'Pink'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 98765 43210',
          email: 'john.doe@example.com',
          address: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        paymentMethod: 'UPI',
        trackingNumber: 'TRK987654321'
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: '2024-01-25',
        status: 'processing',
        total: 3999,
        items: [
          {
            id: '4',
            name: 'Winter Jacket',
            price: 3999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1551698618-1dcef5a1f2d0?w=300&h=300&fit=crop',
            size: 'L',
            color: 'Black'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 98765 43210',
          email: 'john.doe@example.com',
          address: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        paymentMethod: 'Debit Card'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, [user]);

  return { orders, loading };
}
