import { NextResponse } from 'next/server';
import { seedCategories, listCategories } from '@/scripts/seed-categories';

export async function POST() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Only available in development' },
        { status: 403 }
      );
    }

    const result = await seedCategories();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error listing categories:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}