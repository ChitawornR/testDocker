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
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [users] = await pool.query<UserPacket[]>(
      'SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE id = ? AND deletedAt IS NULL',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    return NextResponse.json(user);

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
