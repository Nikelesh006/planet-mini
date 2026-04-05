import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi, CreateAddressData, Address } from '../utils/addressApi';

// Get addresses hook - Similar to useOrders
async function fetchAddresses(userId: string) {
  if (!userId) return [];
  
  try {
    console.log(`🔍 Fetching addresses for userId: ${userId}`);
    
    const addresses = await addressApi.getAddresses();
    console.log('📦 Addresses data received:', addresses);
    console.log('📦 Number of addresses:', addresses.length);
    
    return addresses;
  } catch (error) {
    console.error('❌ Error fetching addresses:', error);
    // Return empty array on authentication error instead of throwing
    if (error instanceof Error && error.message.includes('not authenticated')) {
      return [];
    }
    throw error;
  }
}

export function useAddresses(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => fetchAddresses(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createAddressMutation = useMutation({
    mutationFn: (addressData: CreateAddressData) => addressApi.createAddress(addressData),
    onSuccess: (newAddress) => {
      console.log('✅ Address created successfully:', newAddress);
      // Invalidate and refetch addresses
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => {
      console.error('❌ Error creating address:', error);
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ addressId, addressData }: { addressId: string; addressData: Partial<CreateAddressData> }) => 
      addressApi.updateAddress(addressId, addressData),
    onSuccess: (updatedAddress) => {
      console.log('✅ Address updated successfully:', updatedAddress);
      // Invalidate and refetch addresses
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => {
      console.error('❌ Error updating address:', error);
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) => addressApi.deleteAddress(addressId),
    onSuccess: () => {
      console.log('✅ Address deleted successfully');
      // Invalidate and refetch addresses
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => {
      console.error('❌ Error deleting address:', error);
    }
  });

  return {
    ...query,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isCreatingAddress: createAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
}
