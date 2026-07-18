import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { Loader2, User, Package, LogOut, Edit, Camera, MapPin, Phone, Mail, Calendar, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useProfile, useUpdateProfile, useAddBabyInfo, useDeleteBabyInfo, useUpdateProfileImage } from "../hooks/useProfile";
import { useCloudinary } from "../hooks/useCloudinary";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../contexts/AuthContext";

const BRAND = "#b4c49a";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [babyForm, setBabyForm] = useState({ name: '', age: 0, gender: '' });
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [showBabyAddModal, setShowBabyAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<number | null>(null);

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

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Error loading profile</p>
      </div>
    );
  }

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : authUser?.name || "User";

  const displayEmail = profile?.email || authUser?.email || "user@example.com";

  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ backgroundColor: BRAND }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center sm:items-end gap-6"
          >
            <div className="relative flex-shrink-0">
              {profile?.image || authUser?.image || authUser?.picture ? (
                <img
                  src={profile?.image || authUser?.image || authUser?.picture}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-black text-3xl sm:text-4xl font-light border-4 border-white shadow-xl"
                  style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
                >
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
                className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-black/70 text-xs sm:text-sm uppercase tracking-[0.2em] mb-2 font-medium">My Account</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black mb-2 tracking-tight">
                {displayName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-black/80 text-sm">
                <Mail className="w-4 h-4" />
                <span>{displayEmail}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-900 transition-all duration-200 text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12 sm:pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND}1A` }}>
                    <Edit className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Edit Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Personal Details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        defaultValue={authUser?.name?.split(' ')[0] || profile?.firstName || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="firstName"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        defaultValue={authUser?.name?.split(' ').slice(1).join(' ') || profile?.lastName || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="lastName"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        defaultValue={profile?.phone || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="phone"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        defaultValue={authUser?.email || profile?.email || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Address</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Street Address"
                        defaultValue={profile?.address?.street || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm sm:col-span-2"
                        id="street"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        defaultValue={profile?.address?.city || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="city"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        defaultValue={profile?.address?.state || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                        id="state"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        defaultValue={profile?.address?.pincode || ''}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm sm:col-span-2"
                        id="pincode"
                      />
                    </div>
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
                      handleSaveProfile(formData);
                    }}
                    disabled={updateProfile.isPending}
                    className="w-full sm:w-auto text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: BRAND }}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND}1A` }}>
                  <User className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-500">Your saved contact details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND}1A` }}>
                    <Mail className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="font-medium text-gray-900 text-sm truncate">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND}1A` }}>
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="font-medium text-gray-900 text-sm truncate">{profile?.phone || 'No phone number added'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND}1A` }}>
                    <MapPin className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {profile?.address?.street ?
                        `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.pincode}` :
                        'No address added'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND}1A` }}>
                    <Calendar className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Baby Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND}1A` }}>
                    <User className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Baby Information</h2>
                    <p className="text-sm text-gray-500">Manage your little ones' details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddBaby(!showAddBaby)}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm flex-shrink-0"
                  style={{ backgroundColor: BRAND }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Baby</span>
                </button>
              </div>

              {showAddBaby && (
                <div className="mb-5 p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Baby Name"
                      value={babyForm.name}
                      onChange={(e) => setBabyForm({ ...babyForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Age (months)"
                      min="0"
                      value={babyForm.age}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setBabyForm({ ...babyForm, age: value < 0 ? 0 : value });
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                    />
                    <select
                      value={babyForm.gender}
                      onChange={(e) => setBabyForm({ ...babyForm, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none transition-all text-gray-900 text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleAddBaby}
                      disabled={addBabyInfo.isPending}
                      className="text-white px-5 py-2 rounded-full font-medium disabled:opacity-50 transition-all duration-200 text-sm"
                      style={{ backgroundColor: BRAND }}
                    >
                      {addBabyInfo.isPending ? 'Adding...' : 'Add Baby'}
                    </button>
                    <button
                      onClick={() => setShowAddBaby(false)}
                      className="bg-white text-gray-700 border border-gray-200 px-5 py-2 rounded-full font-medium hover:bg-gray-50 transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {profile?.babyInfo?.map((baby: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {baby.name?.[0]?.toUpperCase() || 'B'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{baby.name}</p>
                        <p className="text-xs text-gray-500">{baby.age} months old • {baby.gender}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setBabyToDelete(index);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )) || (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No baby information added yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/orders"
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND}1A` }}>
                  <Package className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">My Orders</h3>
                  <p className="text-xs text-gray-500">View order history and tracking</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-5">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Orders</span>
                  <span className="font-semibold text-gray-900">{totalOrders}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Spent</span>
                  <span className="font-semibold text-gray-900">₹{totalSpent.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-5">Recent Activity</h3>
              <div className="space-y-4">
                {recentOrder && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Order #{recentOrder.orderNumber || recentOrder.id?.slice(-6)} {recentOrder.status}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{getRelativeTime(recentOrder.createdAt)}</p>
                    </div>
                  </div>
                )}
                {profileUpdatedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Profile updated</p>
                      <p className="text-xs text-gray-500 mt-0.5">{getRelativeTime(profileUpdatedAt)}</p>
                    </div>
                  </div>
                )}
                {!recentOrder && !profileUpdatedAt && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </motion.div>

            {/* Logout */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-red-200 hover:bg-red-50/50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Success Modals */}
      {showProfileUpdateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full"
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full mb-5 mx-auto"
              style={{ backgroundColor: `${BRAND}1A` }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: BRAND }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Profile Updated</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Your profile has been successfully updated.</p>
            <button
              onClick={() => setShowProfileUpdateModal(false)}
              className="w-full text-white py-3 rounded-xl font-medium text-sm transition-colors"
              style={{ backgroundColor: BRAND }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}

      {showBabyAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full"
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full mb-5 mx-auto"
              style={{ backgroundColor: `${BRAND}1A` }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: BRAND }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Baby Added</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Baby information has been successfully added.</p>
            <button
              onClick={() => setShowBabyAddModal(false)}
              className="w-full text-white py-3 rounded-xl font-medium text-sm transition-colors"
              style={{ backgroundColor: BRAND }}
            >
              Great
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-5 mx-auto">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Delete Baby Info?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to remove {profile?.babyInfo?.[babyToDelete || 0]?.name}'s information? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBabyToDelete(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBaby}
                disabled={deleteBabyInfo.isPending}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                {deleteBabyInfo.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
