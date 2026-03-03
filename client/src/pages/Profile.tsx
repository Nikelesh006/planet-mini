import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { Loader2, User, Settings, ShoppingBag, Heart, Package, LogOut, Edit, Camera, MapPin, Phone, Mail, Calendar, Plus, Trash2 } from "lucide-react";
import { useProfile, useUpdateProfile, useAddBabyInfo } from "../hooks/useProfile";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [babyForm, setBabyForm] = useState({ name: '', age: 0, gender: '' });
  
  // Mock userId - replace with actual user authentication
  const userId = "507f1f77bcf86cd799439011";
  
  const { data: profile, isLoading, error } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);
  const addBabyInfo = useAddBabyInfo(userId);

  const handleSaveProfile = async (formData: any) => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
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
      } catch (error) {
        console.error('Failed to add baby info:', error);
      }
    }
  };

  if (isLoading) return (
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
    : "John Doe";
    
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{displayName}</h3>
                  <p className="text-gray-600 mb-3">{profile?.email || 'john.doe@example.com'}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.address?.city || 'New York'}, {profile?.address?.state || 'USA'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Edit Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      defaultValue={profile?.firstName || ''}
                      className="p-2 border rounded-lg"
                      id="firstName"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      defaultValue={profile?.lastName || ''}
                      className="p-2 border rounded-lg"
                      id="lastName"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      defaultValue={profile?.phone || ''}
                      className="p-2 border rounded-lg"
                      id="phone"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={profile?.email || ''}
                      className="p-2 border rounded-lg"
                      id="email"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      defaultValue={profile?.address?.street || ''}
                      className="p-2 border rounded-lg"
                      id="street"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      defaultValue={profile?.address?.city || ''}
                      className="p-2 border rounded-lg"
                      id="city"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      defaultValue={profile?.address?.state || ''}
                      className="p-2 border rounded-lg"
                      id="state"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      defaultValue={profile?.address?.pincode || ''}
                      className="p-2 border rounded-lg"
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
                      handleSaveProfile(formData);
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                </div>
              )}


              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{profile?.email || 'john.doe@example.com'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{profile?.phone || '+1 (555) 123-4567'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
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
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Baby Information</h4>
                  <button 
                    onClick={() => setShowAddBaby(!showAddBaby)}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Baby</span>
                  </button>
                </div>

                {showAddBaby && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Baby Name"
                        value={babyForm.name}
                        onChange={(e) => setBabyForm({...babyForm, name: e.target.value})}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Age (months)"
                        value={babyForm.age}
                        onChange={(e) => setBabyForm({...babyForm, age: parseInt(e.target.value)})}
                        className="p-2 border rounded-lg"
                      />
                      <select
                        value={babyForm.gender}
                        onChange={(e) => setBabyForm({...babyForm, gender: e.target.value})}
                        className="p-2 border rounded-lg"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleAddBaby}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Add Baby
                      </button>
                      <button
                        onClick={() => setShowAddBaby(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {profile?.babyInfo?.map((baby: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{baby.name}</p>
                        <p className="text-sm text-gray-600">{baby.age} months old • {baby.gender}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No baby information added yet</p>
                  )}
                </div>
              </div>


              {/* Profile Menu */}
              <div className="space-y-2">
                <Link
                  href="/profile/orders"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Package className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium">My Orders</span>
                    <p className="text-sm text-gray-500">View order history and tracking</p>
                  </div>
                </Link>
                <Link
                  href="/profile/wishlist"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium">Wishlist</span>
                    <p className="text-sm text-gray-500">{profile?.wishlist?.length || 0} items saved</p>
                  </div>
                </Link>
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium">Settings</span>
                    <p className="text-sm text-gray-500">Account preferences and privacy</p>
                  </div>
                </Link>
                <Link
                  href="/profile/addresses"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium">Addresses</span>
                    <p className="text-sm text-gray-500">Manage shipping addresses</p>
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
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-primary">{profile?.ordersCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wishlist Items</span>
                  <span className="font-semibold text-primary">{profile?.wishlist?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Baby Profiles</span>
                  <span className="font-semibold text-primary">{profile?.babyInfo?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Addresses</span>
                  <span className="font-semibold text-primary">{profile?.address ? 1 : 0}</span>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Order #1234 delivered</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">New item added to wishlist</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Profile updated</p>
                    <p className="text-xs text-gray-500">{new Date(profile?.updatedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                {profile?.babyInfo?.length > 0 && (
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Baby information added</p>
                      <p className="text-xs text-gray-500">Recently</p>
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/shop" className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Start Shopping</span>
                </Link>
                <Link href="/profile/wishlist" className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">View Wishlist</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}