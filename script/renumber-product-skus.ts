import "dotenv/config";
import mongoose from "mongoose";

const DATABASE_URL = process.env.MONGODB_URI || process.env.DATABASE_URL;

const formatSku = (index: number) => `PM-${String(index).padStart(4, "0")}`;

async function renumberProductSkus() {
  if (!DATABASE_URL) {
    throw new Error("MONGODB_URI or DATABASE_URL is required");
  }

  await mongoose.connect(DATABASE_URL, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }

  const products = await db.collection("products").find({}).sort({ createdAt: 1, _id: 1 }).toArray();

  for (const [index, product] of products.entries()) {
    const sku = formatSku(index + 1);
    await db.collection("products").updateOne(
      { _id: product._id },
      { $set: { sku, updatedAt: new Date() } },
    );
    console.log(`${product.name || product._id}: ${sku}`);
  }

  console.log(`Updated ${products.length} product SKU${products.length === 1 ? "" : "s"}.`);
}

renumberProductSkus()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
