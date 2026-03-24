import { useQuery } from "@tanstack/react-query";

async function fetchOrders(userId: string) {
  if (!userId) return [];
  
  console.log(`🔍 Fetching orders for userId: ${userId}`);
  
  const response = await fetch(`/api/orders/${userId}`, {
    credentials: "include",
    headers: {
      'x-user-id': userId,
      'Content-Type': 'application/json'
    }
  });
  
  console.log(`📡 Orders API response status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  
  const data = await response.json();
  console.log('📦 Orders data received:', data);
  console.log('📦 Number of orders:', data.length);
  
  if (data.length > 0) {
    console.log('📦 First order items:', data[0].items);
  }
  
  return data;
}

export function useOrders(userId: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => fetchOrders(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
