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



      clearCart,



    }}>



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



