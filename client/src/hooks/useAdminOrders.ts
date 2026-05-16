import { useQuery } from "@tanstack/react-query";
import { apiFetch } from '../lib/api';

async function fetchAllOrders() {
  console.log('🔍 Fetching all orders for admin');
  
  const response = await apiFetch('/api/admin/orders');
  
  console.log(`📡 Admin Orders API response status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  
  const data = await response.json();
  console.log('📦 Admin Orders data received:', data);
  console.log('📦 Number of orders:', data.length);
  
  return data;
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => fetchAllOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
