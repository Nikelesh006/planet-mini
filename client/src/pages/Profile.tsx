import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, User, Settings, ShoppingBag, Heart, Package, LogOut, Edit, Camera, MapPin, Phone, Mail, Calendar, Plus, Trash2, AlertCircle, CheckCircle, X } from "lucide-react";
import { useProfile, useUpdateProfile, useAddBabyInfo, useDeleteBabyInfo, useUpdateProfileImage } from "../hooks/useProfile";
import { useCloudinary } from "../hooks/useCloudinary";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [babyForm, setBabyForm] = useState({ name: '', age: 0, gender: '' });
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [showBabyAddModal, setShowBabyAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<number | null>(null);

  // Get authenticated Google user
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  
  const userId = authUser?.id || '';
  
  const { data: profile, isLoading, error } = useProfile(userId);
  const { data: orders } = useOrders(userId);
  const updateProfile = useUpdateProfile(userId);
  const addBabyInfo = useAddBabyInfo(userId);
  const deleteBabyInfo = useDeleteBabyInfo(userId);
  const updateProfileImage = useUpdateProfileImage(userId);
  const { uploadImage, isUploading: isUploadingImage } = useCloudinary();

  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;

  // Helper function to format relative time
  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get the most recent activity
  const recentOrder = orders?.[0];
  const profileUpdatedAt = profile?.updatedAt || profile?.createdAt;

  const handleSaveProfile = async (formData: any) => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
      setShowProfileUpdateModal(true);
      setTimeout(() => setShowProfileUpdateModal(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAddBaby = async () => {
    if (babyForm.name && babyForm.age && babyForm.gender) {
      try {
        await addBabyInfo.mutateAsync(babyForm);
        setBabyForm({ name: '', age: 0, gender: '' });
        setShowAddBaby(false);
        setShowBabyAddModal(true);
        setTimeout(() => setShowBabyAddModal(false), 3000);
      } catch (error) {
        console.error('Failed to add baby info:', error);
      }
    }
  };

  const handleDeleteBaby = async () => {
    if (babyToDelete === null) return;
    try {
      await deleteBabyInfo.mutateAsync(babyToDelete);
      setShowDeleteConfirm(false);
      setBabyToDelete(null);
    } catch (error) {
      console.error('Failed to delete baby info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await uploadImage(file);
      if (imageData?.url) {
        await updateProfileImage.mutateAsync(imageData.url);
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
    }
  };

  if (isLoading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Error loading profile</p>
    </div>
  );

  const displayName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : authUser?.name || "User";

  const displayEmail = profile?.email || authUser?.email || "user@example.com";
    
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">My Profile</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 sm:gap-3 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
                <div className="relative flex-shrink-0">
                  {profile?.image || authUser?.image || authUser?.picture ? (
                    <img
                      src={profile?.image || authUser?.image || authUser?.picture}
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg">
                      {initials}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profileImageInput"
                  />
                  <button 
                    onClick={() => document.getElementById('profileImageInput')?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">{displayName}</h3>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-lg">{displayEmail}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
                  <h4 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Edit Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      defaultValue={authUser?.name?.split(' ')[0] || profile?.firstName || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="firstName"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      defaultValue={authUser?.name?.split(' ').slice(1).join(' ') || profile?.lastName || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="lastName"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      defaultValue={profile?.phone || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="phone"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={authUser?.email || profile?.email || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="email"
                    />
                  </div>
                  <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      defaultValue={profile?.address?.street || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="street"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      defaultValue={profile?.address?.city || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="city"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      defaultValue={profile?.address?.state || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="state"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      defaultValue={profile?.address?.pincode || ''}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      id="pincode"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const formData = {
                        firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                        lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                        phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                        email: (document.getElementById('email') as HTMLInputElement)?.value,
                        address: {
                          street: (document.getElementById('street') as HTMLInputElement)?.value,
                          city: (document.getElementById('city') as HTMLInputElement)?.value,
                          state: (document.getElementById('state') as HTMLInputElement)?.value,
                          pincode: (document.getElementById('pincode') as HTMLInputElement)?.value,
                        }
                      };
                      console.log('Frontend sending data:', formData);
                      handleSaveProfile(formData);
                    }}
                    disabled={updateProfile.isPending}
                    className="mt-4 sm:mt-6 w-full sm:w-auto bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}

              {/* Contact Information */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Contact Information</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Email</p>
                      <p className="font-bold text-black group-hover:text-primary transition-colors text-sm sm:text-base truncate">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-secondary/5 to-transparent rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Phone</p>
                      <p className="font-bold text-black group-hover:text-secondary transition-colors text-sm sm:text-base truncate">{profile?.phone || 'No phone number added'}</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-bold text-black group-hover:text-primary transition-colors">
                        {profile?.address?.street ? 
                          `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.pincode}` :
                          'No address added'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baby Information */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h4 className="text-xl sm:text-2xl font-bold text-black">Baby Information</h4>
                  <button 
                    onClick={() => setShowAddBaby(!showAddBaby)}
                    className="flex items-center gap-2 sm:gap-3 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span>Add Baby</span>
                  </button>
                </div>

                {showAddBaby && (
                  <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <input
                        type="text"
                        placeholder="Baby Name"
                        value={babyForm.name}
                        onChange={(e) => setBabyForm({...babyForm, name: e.target.value})}
                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      />
                      <input
                        type="number"
                        placeholder="Age (months)"
                        value={babyForm.age}
                        onChange={(e) => setBabyForm({...babyForm, age: parseInt(e.target.value)})}
                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      />
                      <select
                        value={babyForm.gender}
                        onChange={(e) => setBabyForm({...babyForm, gender: e.target.value})}
                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black text-sm sm:text-base"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={handleAddBaby}
                        disabled={addBabyInfo.isPending}
                        className="bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                      >
                        {addBabyInfo.isPending ? 'Adding...' : 'Add Baby'}
                      </button>
                      <button
                        onClick={() => setShowAddBaby(false)}
                        className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {profile?.babyInfo?.map((baby: any, index: number) => (
                    <div key={index} className="group flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black group-hover:text-primary transition-colors text-sm sm:text-base truncate">{baby.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{baby.age} months old • {baby.gender}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setBabyToDelete(index);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4 sm:py-6 bg-gray-50 rounded-2xl text-sm sm:text-base">No baby information added yet</p>
                  )}
                </div>
              </div>


              {/* Profile Menu */}
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-black group-hover:text-primary transition-colors text-sm sm:text-base">My Orders</span>
                    <p className="text-xs sm:text-sm text-gray-600">View order history and tracking</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>


          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Account Overview</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Total Orders</span>
                  <span className="font-bold text-black text-base sm:text-lg">{totalOrders}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Total Spent</span>
                  <span className="font-bold text-black text-base sm:text-lg">₹{totalSpent.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Member Since</span>
                  <span className="font-bold text-black text-base sm:text-lg">{new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Recent Activity</h3>
              <div className="space-y-3 sm:space-y-4">
                {recentOrder && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 bg-white/50 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-black truncate">
                        Order #{recentOrder.orderNumber || recentOrder.id?.slice(-6)} {recentOrder.status}
                      </p>
                      <p className="text-xs text-gray-500">{getRelativeTime(recentOrder.createdAt)}</p>
                    </div>
                  </div>
                )}
                {profileUpdatedAt && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 bg-white/50 rounded-xl">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-black truncate">Profile updated</p>
                      <p className="text-xs text-gray-500">{getRelativeTime(profileUpdatedAt)}</p>
                    </div>
                  </div>
                )}
                {!recentOrder && !profileUpdatedAt && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 bg-white/50 rounded-xl">
                    <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">No recent activity</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modals */}
      {showProfileUpdateModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Profile Updated!</h3>
            <p className="text-gray-600 text-center mb-6">Your profile has been successfully updated.</p>
            <button
              onClick={() => setShowProfileUpdateModal(false)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      )}

      {showBabyAddModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Baby Added!</h3>
            <p className="text-gray-600 text-center mb-6">Baby information has been successfully added.</p>
            <button
              onClick={() => setShowBabyAddModal(false)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
            >
              Great!
            </button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Delete Baby Info?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to remove {profile?.babyInfo?.[babyToDelete || 0]?.name}'s information? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBabyToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBaby}
                disabled={deleteBabyInfo.isPending}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {deleteBabyInfo.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}