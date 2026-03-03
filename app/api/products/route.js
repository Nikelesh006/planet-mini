import connectToDatabase from '../../../lib/db';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = await connectToDatabase();
    const result = await db.collection('products').insertOne(data);
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    return Response.json({ error: 'Failed to create' }, { status: 500 });
  }
}
