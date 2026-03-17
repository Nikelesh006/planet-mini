import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

export default function CartIcon() {
  const { state } = useCart();

  return (
    <Link 
      href="/cart" 
      className="relative p-2 hover:bg-gray-100 rounded-full transition-all group"
    >
      <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-primary" />
      {state.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {state.totalItems > 99 ? '99+' : state.totalItems}
        </span>
      )}
    </Link>
  );
}
