import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
