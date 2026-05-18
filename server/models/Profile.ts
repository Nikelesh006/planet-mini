import mongoose from 'mongoose';



const profileSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  firstName: { type: String, required: true },

  lastName: { type: String },

  email: { type: String, required: true, unique: true },

  image: String,

  phone: String,

  address: {

    street: String,

    city: String,

    state: String,

    pincode: String

  },

  babyInfo: [{

    name: String,

    age: Number,

    gender: String

  }],

  wishlist:  { type: [String], default: [] },

  cartItems: { type: Array, default: [] },

  orders: [{
    orderId: String,
    items: Array,
    total: Number,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],

  joined: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },

  location: { type: String, default: 'USA' }

}, { timestamps: true });



export default mongoose.models.Profile || mongoose.model('Profile', profileSchema);

