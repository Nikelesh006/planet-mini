import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Converts a price to the 9s pricing pattern
 * Examples: 200 → 199, 230 → 229, 345 → 339
 * @param price - The original price
 * @returns The price converted to end with 9
 */
function convertToPriceEndingIn9(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  return Math.floor((price + 1) / 10) * 10 - 1;
}

async function updatePricesTo9s() {
  const DATABASE_URL = process.env.MONGODB_URI || process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL or MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    console.log(`📦 Found ${products.length} products`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const updateData: any = {};
      let needsUpdate = false;

      // Convert sellingPrice
      if (product.sellingPrice && Number.isFinite(product.sellingPrice)) {
        const originalPrice = Number(product.sellingPrice);
        const newPrice = convertToPriceEndingIn9(originalPrice);
        
        if (originalPrice !== newPrice) {
          updateData.sellingPrice = newPrice;
          needsUpdate = true;
          console.log(`  📝 Product "${product.name}" (ID: ${product._id}): sellingPrice ${originalPrice} → ${newPrice}`);
        }
      }

      // Convert mrp
      if (product.mrp && Number.isFinite(product.mrp)) {
        const originalMrp = Number(product.mrp);
        const newMrp = convertToPriceEndingIn9(originalMrp);
        
        if (originalMrp !== newMrp) {
          updateData.mrp = newMrp;
          needsUpdate = true;
          console.log(`  📝 Product "${product.name}" (ID: ${product._id}): mrp ${originalMrp} → ${newMrp}`);
        }
      }

      if (needsUpdate) {
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: updateData }
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n✅ Price update completed');
    console.log(`📊 Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already in 9s pattern)`);

  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
updatePricesTo9s();
