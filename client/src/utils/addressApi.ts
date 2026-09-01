// Address API helper functions
import { toast } from 'react-hot-toast';
import { apiFetch } from '../lib/api';

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  pincode: string;
  street: string;
  city: string;
  state: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  fullName: string;
  phone: string;
  pincode: string;
  street: string;
  city: string;
  state: string;
}

// Get current user ID from auth context, localStorage, or jwtToken payload
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    // 1. Check for auth user in localStorage (set by auth context)
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        const userId = user?.id || user?.sub || user?.userId;
        if (userId) return String(userId);
      } catch (e) {
        console.error('Failed to parse auth user:', e);
      }
    }
    
    // 2. Check direct userId in localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      return String(userId);
    }

    // 3. Extract from jwtToken payload in localStorage
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          const extractedId = payload?.id || payload?.sub || payload?.userId;
          if (extractedId) return String(extractedId);
        }
      } catch (err) {
        console.warn('Could not parse jwtToken payload:', err);
      }
    }
  }
  return null;
};

export const addressApi = {
  // Get all addresses for current user from database
  async getAddresses(): Promise<Address[]> {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('🔍 No user ID found, returning empty addresses');
        return [];
      }
      
      console.log(`🔍 Fetching addresses for userId: ${userId}`);
      
      const response = await apiFetch('/api/addresses', {
        method: 'GET',
      });

      console.log(`📡 Address API response status: ${response.status}`);

      if (!response.ok) {
        throw new Error('Failed to fetch addresses from database');
      }

      const data = await response.json();
      console.log('📦 Addresses data received:', data.addresses);
      console.log('📦 Number of addresses:', data.addresses?.length);
      
      return data.addresses || [];
    } catch (error) {
      console.error('Error fetching addresses from database:', error);
      toast.error('Failed to load addresses from database');
      return [];
    }
  },

  // Create a new address and store in database
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('🔍 No user ID found, cannot create address');
        throw new Error('User not authenticated. Please login to continue.');
      }
      
      console.log(`🔍 Creating address for userId: ${userId}`, addressData);
      
      const response = await apiFetch('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });

      console.log(`📡 Create address API response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save address to database');
      }

      const data = await response.json();
      console.log('✅ Address saved to database:', data.address);
      toast.success('Address saved successfully!');
      
      // Set flag to indicate new address was added
      if (typeof window !== 'undefined') {
        localStorage.setItem('justAddedAddress', 'true');
      }
      
      return data.address;
    } catch (error) {
      console.error('Error saving address to database:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save address');
      throw error;
    }
  },

  // Update an existing address in database
  async updateAddress(addressId: string, addressData: Partial<CreateAddressData>): Promise<Address> {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('🔍 No user ID found, cannot update address');
        throw new Error('User not authenticated. Please login to continue.');
      }
      
      console.log(`🔍 Updating address ${addressId} for userId: ${userId}`, addressData);
      
      const response = await apiFetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });

      console.log(`📡 Update address API response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update address');
      }

      const data = await response.json();
      console.log('✅ Address updated in database:', data.address);
      toast.success('Address updated successfully!');
      
      return data.address;
    } catch (error) {
      console.error('Error updating address in database:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update address');
      throw error;
    }
  },

  // Delete an address from database
  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('🔍 No user ID found, cannot delete address');
        throw new Error('User not authenticated. Please login to continue.');
      }
      
      console.log(`🔍 Deleting address ${addressId} for userId: ${userId}`);
      
      const response = await apiFetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      console.log(`📡 Delete address API response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete address');
      }

      const data = await response.json();
      console.log('✅ Address deleted from database');
      toast.success('Address deleted successfully!');
      
      return true;
    } catch (error) {
      console.error('Error deleting address from database:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete address');
      throw error;
    }
  }
};
