import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface UserPacket extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [users] = await pool.query<UserPacket[]>(
      'SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE deletedAt IS NULL'
    );

    return NextResponse.json(users);

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
