import { createContext, useContext, useReducer, useEffect } from 'react';



import { useAuth } from './AuthContext';







interface CartItem {



  id: string;



  name: string;



  price: number;



  originalPrice?: number;



  image: string;



  quantity: number;



  category?: string;



  subcategory?: string;



  size?: string;



  color?: string;



}







interface CartState {



  items: CartItem[];



  totalItems: number;



  totalPrice: number;



}







type CartAction =



  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }



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



      



      if (existingItem) {



        newItems = state.items.map(item =>



          item.id === action.payload.id



            ? { ...item, quantity: item.quantity + 1 }



            : item



        );



      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };



    case 'REMOVE_FROM_CART':



      const filteredItems = state.items.filter(item => item.id !== action.payload.id);



      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };



    case 'INCREASE_QUANTITY':



      const increasedItems = state.items.map(item =>



        item.id === action.payload.id



          ? { ...item, quantity: item.quantity + 1 }



          : item



      );



      return {
        ...state,
        items: increasedItems,
        totalItems: increasedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: increasedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
        totalPrice: decreasedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
        totalPrice: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };



    



    default:



      return state;



  }



};







export const CartContext = createContext<{

  state: CartState;

  addToCart: (product: Omit<CartItem, 'quantity'>) => void;

  removeFromCart: (id: string) => void;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;

  clearCart: () => void;

} | null>(null);







export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [state, dispatch] = useReducer(cartReducer, initialState);

  const { user } = useAuth();

  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
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
      const response = await fetch(`/api/profile/${user.id}/cart`, {
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

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
    if (!user) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/profile/${user.id}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Refresh cart from backend
        await loadCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/profile/${user.id}/cart/${id}`, {
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

    if (!user) {
      console.error('ERROR: No user logged in');
      return;
    }

    // Find the item in current state
    const item = state.items.find(i => i.id === id);
    console.log('Found item in state:', item);

    if (!item) {
      console.error('ERROR: Item not found in cart state');
      return;
    }

    // Optimistic update - update UI immediately
    console.log('Dispatching INCREASE_QUANTITY for id:', id);
    dispatch({ type: 'INCREASE_QUANTITY', payload: { id } });

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('ERROR: No auth token found');
        return;
      }

      const url = `/api/profile/${user.id}/cart/${id}/increase`;
      console.log('Making PATCH request to:', url);
      console.log('Token present:', !!token);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        // Re-sync to correct state if API failed
        await loadCart();
      }
    } catch (error) {
      console.error('Network/Error in increaseQuantity:', error);
      await loadCart();
    }
    console.log('>>> INCREASE QUANTITY COMPLETE <<<');
  };

  const decreaseQuantity = async (id: string) => {
    console.log('>>> DECREASE QUANTITY CALLED <<<');
    console.log('Item ID:', id);

    if (!user) {
      console.error('ERROR: No user logged in');
      return;
    }

    const item = state.items.find(item => item.id === id);
    if (!item) {
      console.error('ERROR: Item not found in cart state');
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
        return;
      }

      const url = `/api/profile/${user.id}/cart/${id}/decrease`;
      console.log('Making PATCH request to:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API success, reloading cart');
        await loadCart();
      } else {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        await loadCart();
      }
    } catch (error) {
      console.error('Network/Error in decreaseQuantity:', error);
      await loadCart();
    }
    console.log('>>> DECREASE QUANTITY COMPLETE <<<');
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/profile/${user.id}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
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



