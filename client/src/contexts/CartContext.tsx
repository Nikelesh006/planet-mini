import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../lib/api';

import { getAvailableStock, isOutOfStock } from '@shared/stock';















export interface CartItem {







  id: string;







  name: string;







  sellingPrice: number;

  mrp?: number;







  image: string;







  quantity: number;







  category?: string;







  subcategory?: string;







  size?: string;







  color?: string;

  stockQuantity?: number | null;

  source?: 'normal' | 'bundle' | 'gift-bundle';

  bundleId?: string;







}















interface CartState {







  items: CartItem[];







  totalItems: number;







  totalPrice: number;







}















type CartAction =







  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }







  | { type: 'REMOVE_FROM_CART'; payload: { id: string } }







  | { type: 'INCREASE_QUANTITY'; payload: { id: string } }







  | { type: 'DECREASE_QUANTITY'; payload: { id: string } }







  | { type: 'CLEAR_CART' }







  | { type: 'LOAD_CART'; payload: CartItem[] };















const initialState: CartState = {







  items: [],







  totalItems: 0,







  totalPrice: 0,







};















const cartReducer = (state: CartState, action: CartAction): CartState => {







  switch (action.type) {







    case 'ADD_TO_CART':







      const existingItem = state.items.find(item => item.id === action.payload.id);







      let newItems: CartItem[];







      







      const requestedQuantity = Math.max(1, Number(action.payload.quantity || 1));

      const availableStock = getAvailableStock(action.payload);



      if (isOutOfStock(action.payload)) {

        return state;

      }



      if (existingItem) {







        newItems = state.items.map(item =>







          item.id === action.payload.id







            ? { ...item, quantity: Math.min(item.quantity + requestedQuantity, availableStock) }







            : item







        );







      } else {

        newItems = [...state.items, { ...action.payload, quantity: Math.min(requestedQuantity, availableStock) }];

      }



      return {

        ...state,

        items: newItems,

        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),

        totalPrice: newItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

      };







    case 'REMOVE_FROM_CART':







      const filteredItems = state.items.filter(item => item.id !== action.payload.id);







      return {

        ...state,

        items: filteredItems,

        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),

        totalPrice: filteredItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

      };







    case 'INCREASE_QUANTITY':







      const increasedItems = state.items.map(item =>







        item.id === action.payload.id







          ? { ...item, quantity: Math.min(item.quantity + 1, getAvailableStock(item)) }







          : item







      );







      return {

        ...state,

        items: increasedItems,

        totalItems: increasedItems.reduce((sum, item) => sum + item.quantity, 0),

        totalPrice: increasedItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

      };







    case 'DECREASE_QUANTITY':

      const decreasedItems = state.items.map(item =>

        item.id === action.payload.id

          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }

          : item

      );



      return {

        ...state,

        items: decreasedItems,

        totalItems: decreasedItems.reduce((sum, item) => sum + item.quantity, 0),

        totalPrice: decreasedItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

      };







    case 'CLEAR_CART':







      return {

        ...state,

        items: [],

        totalItems: 0,

        totalPrice: 0,

      };







    







    case 'LOAD_CART':







      return {

        ...state,

        items: action.payload,

        totalItems: action.payload.reduce((sum, item) => sum + item.quantity, 0),

        totalPrice: action.payload.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0),

      };







    







    default:







      return state;







  }







};















export const CartContext = createContext<{



  state: CartState;



  addToCart: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<boolean>;



  removeFromCart: (id: string) => void;



  increaseQuantity: (id: string) => void;



  decreaseQuantity: (id: string) => void;



  clearCart: () => void;



} | null>(null);















const BRAND = "#b4c49a";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [state, dispatch] = useReducer(cartReducer, initialState);



  const { user } = useAuth();



  const getAuthToken = () => {

    return document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1] || localStorage.getItem('jwtToken');

  };



  // Load cart from Profile API on mount or when user changes

  useEffect(() => {

    console.log('🛒 CartContext: User changed', { user: user?.email, hasUser: !!user });

    

    // Clear cart when user logs out

    if (!user) {

      console.log('🗑️ CartContext: Clearing cart - user logged out');

      dispatch({ type: 'CLEAR_CART' });

      return;

    }



    loadCart();

  }, [user]);



  const loadCart = async () => {

    if (!user) return;



    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/cart`, {

        headers: {

          'Authorization': `Bearer ${token}`,

        },

      });



      if (response.ok) {

        const cartItems = await response.json();

        dispatch({ type: 'LOAD_CART', payload: cartItems });

      }

    } catch (error) {

      console.error('Error loading cart:', error);

    }

  };



  const addToCart = async (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {

    console.log('>>> addToCart called <<<');

    console.log('User:', user?.id, user?.email);

    console.log('Product:', product);

    console.log('Is out of stock:', isOutOfStock(product));

    

    if (!user) {

      console.error('ERROR: No user logged in');

      return false;

    }

    

    if (isOutOfStock(product)) {

      console.error('ERROR: Product is out of stock');

      return false;

    }



    try {

      const token = getAuthToken();

      console.log('Token present:', !!token);

      

      const payload = {

        ...product,

        quantity: Math.max(1, Number(product.quantity || 1)),

      };

      console.log('Payload:', payload);

      

      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/cart`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`,

        },

        body: JSON.stringify(payload),

      });



      console.log('Response status:', response.status, response.statusText);



      if (response.ok) {

        console.log('API success, reloading cart');

        // Refresh cart from backend

        await loadCart();

        return true;

      }



      const errorData = await response.json().catch(() => null);

      console.error('Error adding to cart:', errorData?.message || errorData?.error || response.statusText);

      console.error('Error data:', errorData);

      await loadCart();

      return false;

    } catch (error) {

      console.error('Error adding to cart:', error);

      return false;

    }

  };



  const removeFromCart = async (id: string) => {

    if (!user) return;



    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/cart/${id}`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${token}`,

        },

      });



      if (response.ok) {

        // Refresh cart from backend

        await loadCart();

      }

    } catch (error) {

      console.error('Error removing from cart:', error);

    }

  };



  const increaseQuantity = async (id: string) => {

    console.log('>>> INCREASE QUANTITY CALLED <<<');

    console.log('Item ID:', id);

    console.log('User:', user?.id, user?.email);

    console.log('All cart item IDs:', state.items.map(i => ({ id: i.id, name: i.name })));



    if (!user) {

      console.error('ERROR: No user logged in');

      alert('Please log in to modify your cart');

      return;

    }



    // Find the item in current state

    const item = state.items.find(i => i.id === id);

    console.log('Found item in state:', item);



    if (!item) {

      console.error('ERROR: Item not found in cart state');

      alert('Item not found in cart');

      return;

    }



    const availableStock = getAvailableStock(item);

    console.log('Available stock:', availableStock, 'Current quantity:', item.quantity);



    if (item.quantity >= availableStock) {

      console.error('ERROR: Requested quantity exceeds available stock');

      alert(`Only ${availableStock} items available in stock`);

      await loadCart();

      return;

    }



    // Optimistic update - update UI immediately

    console.log('Dispatching INCREASE_QUANTITY for id:', id);

    dispatch({ type: 'INCREASE_QUANTITY', payload: { id } });



    try {

      const token = getAuthToken();

      if (!token) {

        console.error('ERROR: No auth token found');

        alert('Authentication error. Please log in again');

        await loadCart();

        return;

      }



      const url = `${API_BASE_URL}/api/profile/${user.id}/cart/${id}/increase`;

      console.log('Making PATCH request to:', url);

      console.log('Token present:', !!token);



      const response = await fetch(url, {

        method: 'PATCH',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json',

        },

        credentials: 'include',

      });



      console.log('Response status:', response.status, response.statusText);



      if (response.ok) {

        const data = await response.json();

        console.log('API success, response:', data);

        // Reload cart to sync with backend

        await loadCart();

        console.log('Cart reloaded after increase');

      } else {

        const errorText = await response.text();

        console.error('API error:', response.status, errorText);

        alert(`Failed to update quantity: ${errorText}`);

        // Re-sync to correct state if API failed

        await loadCart();

      }

    } catch (error) {

      console.error('Network/Error in increaseQuantity:', error);

      alert('Network error. Please check your connection');

      await loadCart();

    }

    console.log('>>> INCREASE QUANTITY COMPLETE <<<');

  };



  const decreaseQuantity = async (id: string) => {

    console.log('>>> DECREASE QUANTITY CALLED <<<');

    console.log('Item ID:', id);

    console.log('User:', user?.id, user?.email);

    console.log('All cart item IDs:', state.items.map(i => ({ id: i.id, name: i.name })));



    if (!user) {

      console.error('ERROR: No user logged in');

      alert('Please log in to modify your cart');

      return;

    }



    const item = state.items.find(item => item.id === id);

    if (!item) {

      console.error('ERROR: Item not found in cart state');

      alert('Item not found in cart');

      return;

    }



    console.log('Current quantity:', item.quantity);



    // Stop at quantity 1 - do not decrease further or remove item

    if (item.quantity <= 1) {

      console.log('Quantity is 1, stopping (minimum reached)');

      return;

    }



    // Optimistic update - update UI immediately

    console.log('Dispatching DECREASE_QUANTITY for id:', id);

    dispatch({ type: 'DECREASE_QUANTITY', payload: { id } });



    try {

      const token = getAuthToken();

      if (!token) {

        console.error('ERROR: No auth token found');

        alert('Authentication error. Please log in again');

        await loadCart();

        return;

      }



      const url = `${API_BASE_URL}/api/profile/${user.id}/cart/${id}/decrease`;

      console.log('Making PATCH request to:', url);



      const response = await fetch(url, {

        method: 'PATCH',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json',

        },

        credentials: 'include',

      });



      console.log('Response status:', response.status);



      if (response.ok) {

        const data = await response.json();

        console.log('API success, reloading cart');

        await loadCart();

      } else {

        const errorText = await response.text();

        console.error('API error:', response.status, errorText);

        alert(`Failed to update quantity: ${errorText}`);

        await loadCart();

      }

    } catch (error) {

      console.error('Network/Error in decreaseQuantity:', error);

      alert('Network error. Please check your connection');

      await loadCart();

    }

    console.log('>>> DECREASE QUANTITY COMPLETE <<<');

  };



  const clearCart = async () => {

    // Clear local state immediately (optimistic update)

    dispatch({ type: 'CLEAR_CART' });



    if (!user) return;



    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/profile/${user.id}/cart`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${token}`,

        },

      });



      if (response.ok) {

        console.log('🗑️ Cart cleared on server');

      } else {

        console.error('Failed to clear cart on server, status:', response.status);

      }

    } catch (error) {

      console.error('Error clearing cart on server:', error);

    }

  };





  return (







    <CartContext.Provider value={{



      state,



      addToCart,



      removeFromCart,



      increaseQuantity,



      decreaseQuantity,



      clearCart,



    }}



    >

      {children}

    </CartContext.Provider>







  );







};















export const useCart = () => {







  const context = useContext(CartContext);







  if (!context) {







    throw new Error('useCart must be used within a CartProvider');







  }







  return context;







};







