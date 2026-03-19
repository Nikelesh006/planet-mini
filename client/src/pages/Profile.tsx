import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, User, Settings, ShoppingBag, Heart, Package, LogOut, Edit, Camera, MapPin, Phone, Mail, Calendar, Plus, Trash2, AlertCircle, CheckCircle, X } from "lucide-react";
import { useProfile, useUpdateProfile, useAddBabyInfo } from "../hooks/useProfile";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [babyForm, setBabyForm] = useState({ name: '', age: 0, gender: '' });
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [showBabyAddModal, setShowBabyAddModal] = useState(false);
  
  // Get authenticated Google user
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  
  const userId = authUser?.id || '';
  
  const { data: profile, isLoading, error } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);
  const addBabyInfo = useAddBabyInfo(userId);

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

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-black">My Profile</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Edit className="w-5 h-5 text-black" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-2">{displayName}</h3>
                  <p className="text-gray-700 mb-4 text-lg">{displayEmail}</p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 hover:text-secondary transition-colors">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">{profile?.address?.city || 'New York'}, {profile?.address?.state || 'USA'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
                  <h4 className="text-xl font-bold text-black mb-6">Edit Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      defaultValue={authUser?.name?.split(' ')[0] || profile?.firstName || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      id="firstName"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      defaultValue={authUser?.name?.split(' ').slice(1).join(' ') || profile?.lastName || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black"
                      id="lastName"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      defaultValue={profile?.phone || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      id="phone"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={authUser?.email || profile?.email || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black"
                      id="email"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      defaultValue={profile?.address?.street || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      id="street"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      defaultValue={profile?.address?.city || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black"
                      id="city"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      defaultValue={profile?.address?.state || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      id="state"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      defaultValue={profile?.address?.pincode || ''}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black"
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
                    className="mt-6 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-black mb-6">Contact Information</h4>
                <div className="space-y-4">
                  <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-bold text-black group-hover:text-primary transition-colors">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/5 to-transparent rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-bold text-black group-hover:text-secondary transition-colors">{profile?.phone || '+1 (555) 123-4567'}</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-bold text-black group-hover:text-primary transition-colors">
                        {profile?.address?.street ? 
                          `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.pincode}` :
                          '123 Baby Street, New York, NY 10001'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baby Information */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-black">Baby Information</h4>
                  <button 
                    onClick={() => setShowAddBaby(!showAddBaby)}
                    className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5 text-black" />
                    <span>Add Baby</span>
                  </button>
                </div>

                {showAddBaby && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Baby Name"
                        value={babyForm.name}
                        onChange={(e) => setBabyForm({...babyForm, name: e.target.value})}
                        className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      />
                      <input
                        type="number"
                        placeholder="Age (months)"
                        value={babyForm.age}
                        onChange={(e) => setBabyForm({...babyForm, age: parseInt(e.target.value)})}
                        className="p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-colors text-black"
                      />
                      <select
                        value={babyForm.gender}
                        onChange={(e) => setBabyForm({...babyForm, gender: e.target.value})}
                        className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-black"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={handleAddBaby}
                        disabled={addBabyInfo.isPending}
                        className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {addBabyInfo.isPending ? 'Adding...' : 'Add Baby'}
                      </button>
                      <button
                        onClick={() => setShowAddBaby(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {profile?.babyInfo?.map((baby: any, index: number) => (
                    <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
                      <div className="flex-1">
                        <p className="font-bold text-black group-hover:text-primary transition-colors">{baby.name}</p>
                        <p className="text-sm text-gray-600">{baby.age} months old • {baby.gender}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-2xl">No baby information added yet</p>
                  )}
                </div>
              </div>


              {/* Profile Menu */}
              <div className="space-y-3">
                <Link
                  href="/profile/orders"
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-black group-hover:text-primary transition-colors">My Orders</span>
                    <p className="text-sm text-gray-600">View order history and tracking</p>
                  </div>
                </Link>
                <Link
                  href="/profile/wishlist"
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/5 to-transparent rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-black group-hover:text-secondary transition-colors">Wishlist</span>
                    <p className="text-sm text-gray-600">{profile?.wishlist?.length || 0} items saved</p>
                  </div>
                </Link>
                <Link
                  href="/profile/settings"
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-black group-hover:text-primary transition-colors">Settings</span>
                    <p className="text-sm text-gray-600">Account preferences and privacy</p>
                  </div>
                </Link>
                <Link
                  href="/profile/addresses"
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/5 to-transparent rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-black group-hover:text-secondary transition-colors">Addresses</span>
                    <p className="text-sm text-gray-600">Manage shipping addresses</p>
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
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-black mb-6">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Orders</span>
                  <span className="font-bold text-primary text-lg">{profile?.ordersCount || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium">Total Spent</span>
                  <span className="font-bold text-secondary text-lg">${profile?.totalSpent || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <span className="text-gray-700 font-medium">Member Since</span>
                  <span className="font-bold text-black text-lg">{new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                </div>
            </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-lg p-8 border border-primary/20 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-black mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">Order #1234 delivered</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">Profile updated</p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>
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
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Profile Updated!</h3>
            <p className="text-gray-600 text-center mb-6">Your profile has been successfully updated.</p>
            <button
              onClick={() => setShowProfileUpdateModal(false)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
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
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Baby Added!</h3>
            <p className="text-gray-600 text-center mb-6">Baby information has been successfully added.</p>
            <button
              onClick={() => setShowBabyAddModal(false)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
            >
              Great!
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}