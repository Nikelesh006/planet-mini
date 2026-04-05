import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin, Phone, User, Home } from 'lucide-react';
import { addressApi, CreateAddressData } from '../utils/addressApi';
import { useAuth } from '../contexts/AuthContext';

export default function AddAddressPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAddressData>({
    fullName: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState<Partial<CreateAddressData>>({});
  
  // Debug: Log authentication state
  console.log('🔍 AddAddressPage - Auth state:', { 
    user: user ? {
      id: user.id,
      sub: user.sub,
      email: user.email,
      name: user.name
    } : null, 
    isLoading 
  });
  
  // Debug: Check if user has required properties
  if (user) {
    console.log('🔍 AddAddressPage - User ID sources:', {
      fromId: user.id,
      fromSub: user.sub,
      finalUserId: user.id || user.sub,
      hasEmail: !!user.email,
      hasName: !!user.name
    });
  }
  
  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    console.log('🚫 AddAddressPage - No user found, redirecting to login');
    window.location.href = '/';
    return null;
  }
  
  if (isLoading) {
    console.log('⏳ AddAddressPage - Loading authentication...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAddressData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pin code must be 6 digits';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateAddressData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Double-check authentication before submitting
    if (!user) {
      console.log('🚫 AddAddressPage - No user found during submit, redirecting to login');
      alert('Please login to add an address');
      window.location.href = '/';
      return;
    }

    console.log('🔍 AddAddressPage - Submitting address for user:', user.id || user.sub);
    setIsSubmitting(true);

    try {
      await addressApi.createAddress(formData);
      
      // Set flag to indicate new address was just added
      localStorage.setItem('justAddedAddress', 'true');
      
      // Use window.location for more reliable navigation
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/cart'}
              className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Form */}
          <div className="max-w-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Add Shipping <span className="text-pink-500">Address</span>
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Phone number"
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Pin Code */}
              <div>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={handleInputChange('pincode')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Pin code"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <textarea
                  value={formData.street}
                  onChange={handleInputChange('street')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none resize-none transition-all ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Address (Area and Street)"
                  rows={3}
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                )}
              </div>

              {/* City and State - Two columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City/District/Town"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Saving...' : 'SAVE ADDRESS'}
              </button>
            </form>
          </div>

          {/* Right Column - Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Map Phone Illustration */}
              <svg className="w-full h-auto" viewBox="0 0 500 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Phone Frame */}
                <rect x="150" y="50" width="200" height="400" rx="20" stroke="#333" strokeWidth="3" fill="#f8f9fa"/>
                <rect x="160" y="70" width="180" height="360" rx="10" fill="#e3f2fd"/>
                
                {/* Map Grid Lines */}
                <path d="M170 150 L330 150 M170 200 L330 200 M170 250 L330 250 M170 300 L330 300 M170 350 L330 350" 
                      stroke="#bbdefb" strokeWidth="1"/>
                <path d="M200 100 L200 400 M250 100 L250 400 M300 100 L300 400" 
                      stroke="#bbdefb" strokeWidth="1"/>
                
                {/* Roads */}
                <path d="M180 250 Q250 230 320 250" stroke="#90caf9" strokeWidth="2" fill="none"/>
                <path d="M220 120 Q240 250 220 380" stroke="#90caf9" strokeWidth="2" fill="none"/>
                
                {/* Location Pins on Map */}
                <circle cx="210" cy="200" r="5" fill="#e91e63"/>
                <circle cx="290" cy="280" r="5" fill="#e91e63"/>
                <circle cx="250" cy="320" r="5" fill="#e91e63"/>
                
                {/* Main Large Location Pin */}
                <g transform="translate(250, 200)">
                  {/* Pin Body */}
                  <path d="M0 -25 C-13 -25 -25 -13 -25 0 C-25 13 -12 25 0 45 C12 25 25 13 25 0 C25 -13 13 -25 0 -25 Z" 
                        fill="#e91e63"/>
                  {/* Pin Center */}
                  <circle cx="0" cy="-5" r="8" fill="white"/>
                  <circle cx="0" cy="-5" r="4" fill="#e91e63"/>
                </g>
                
                {/* Person Standing Next to Phone */}
                <g transform="translate(380, 320)">
                  {/* Body */}
                  <ellipse cx="0" cy="40" rx="25" ry="35" fill="#9e9e9e"/>
                  {/* Head */}
                  <circle cx="0" cy="0" r="20" fill="#9e9e9e"/>
                  {/* Hair */}
                  <path d="M-15 -5 Q-20 -20 0 -25 Q20 -20 15 -5" fill="#333"/>
                  {/* Arm pointing to phone */}
                  <path d="M-20 30 L-50 20" stroke="#9e9e9e" strokeWidth="6" strokeLinecap="round"/>
                  {/* Hand */}
                  <circle cx="-52" cy="18" r="6" fill="#9e9e9e"/>
                  {/* Legs */}
                  <rect x="-15" y="70" width="10" height="40" fill="#9e9e9e"/>
                  <rect x="5" y="70" width="10" height="40" fill="#9e9e9e"/>
                </g>
                
                {/* Small decorative elements */}
                <circle cx="100" cy="150" r="8" fill="#ffcdd2" opacity="0.5"/>
                <circle cx="400" cy="400" r="12" fill="#ffcdd2" opacity="0.5"/>
                <circle cx="420" cy="100" r="6" fill="#ffcdd2" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
