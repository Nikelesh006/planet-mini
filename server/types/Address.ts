// Address interface for database storage
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
