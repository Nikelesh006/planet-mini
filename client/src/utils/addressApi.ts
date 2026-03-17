// Address API helper functions
import { toast } from 'react-hot-toast';

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

// Get current user ID from auth context or localStorage
const getCurrentUserId = (): string => {
  return localStorage.getItem('userId') || 'user123'; // Should come from auth context
};

export const addressApi = {
  // Get all addresses for the current user from database
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await fetch('/api/addresses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCurrentUserId()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses from database');
      }

      const data = await response.json();
      console.log('Fetched addresses from database:', data.addresses);
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
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCurrentUserId()}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save address to database');
      }

      const data = await response.json();
      console.log('Address saved to database:', data.address);
      toast.success('Address saved successfully!');
      
      // Set flag to indicate new address was added
      localStorage.setItem('justAddedAddress', 'true');
      
      return data.address;
    } catch (error) {
      console.error('Error saving address to database:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save address');
      throw error;
    }
  }
};
