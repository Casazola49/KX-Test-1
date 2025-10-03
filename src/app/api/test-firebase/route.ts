import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Intentar hacer una consulta simple para probar la conexión
    const testCollection = db.collection('test');
    const snapshot = await testCollection.limit(1).get();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase connection successful',
      docsCount: snapshot.size
    });
  } catch (error: any) {
    console.error('Firebase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: 'Check Firebase configuration in .env.local'
      },
      { status: 500 }
    );
  }
}