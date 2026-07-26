import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../db';
import SpinWheelPrize from '../models/SpinWheelPrize';

async function seedSpinWheelPrizes() {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing existing prizes...');
    await SpinWheelPrize.deleteMany({});
    
    console.log('🎰 Seeding spin wheel prizes...');
    
    const prizes = [
      {
        label: "Get 10% Off",
        color: "#4DB6AC",
        discountPercentage: 10,
        discountType: "percentage",
        discountValue: 10,
        isSpinAgain: false,
        isNoLuck: false,
        isActive: true,
        position: 0
      },
      {
        label: "Get 5% Off",
        color: "#2D7A7A",
        discountPercentage: 5,
        discountType: "percentage",
        discountValue: 5,
        isSpinAgain: false,
        isNoLuck: false,
        isActive: true,
        position: 1
      },
      {
        label: "Get 15% Off",
        color: "#F4D03F",
        discountPercentage: 15,
        discountType: "percentage",
        discountValue: 15,
        isSpinAgain: false,
        isNoLuck: false,
        isActive: true,
        position: 2
      },
      {
        label: "No Luck",
        color: "#7FB069",
        discountType: "none",
        isSpinAgain: false,
        isNoLuck: true,
        isActive: true,
        position: 3
      },
      {
        label: "Get 10% Off",
        color: "#4DB6AC",
        discountPercentage: 10,
        discountType: "percentage",
        discountValue: 10,
        isSpinAgain: false,
        isNoLuck: false,
        isActive: true,
        position: 4
      },
      {
        label: "Get 5% Off",
        color: "#2D7A7A",
        discountPercentage: 5,
        discountType: "percentage",
        discountValue: 5,
        isSpinAgain: false,
        isNoLuck: false,
        isActive: true,
        position: 5
      },
      {
        label: "Spin Again",
        color: "#F4D03F",
        discountType: "none",
        isSpinAgain: true,
        isNoLuck: false,
        isActive: true,
        position: 6
      },
      {
        label: "No Luck",
        color: "#7FB069",
        discountType: "none",
        isSpinAgain: false,
        isNoLuck: true,
        isActive: true,
        position: 7
      }
    ];
    
    await SpinWheelPrize.insertMany(prizes);
    
    console.log('✅ Spin wheel prizes seeded successfully!');
    console.log(`📊 Total prizes: ${prizes.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding prizes:', error);
    process.exit(1);
  }
}

seedSpinWheelPrizes();
