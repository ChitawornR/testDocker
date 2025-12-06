import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { RowDataPacket } from 'mysql2';

interface UserPacket extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const [users] = await pool.query<UserPacket[]>(
      'SELECT id, email, role, password FROM users WHERE email = ? AND deletedAt IS NULL',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is not set');
        throw new Error('JWT_SECRET is not set');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Set the token in an HttpOnly cookie
    (await
      // Set the token in an HttpOnly cookie
      cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60, // 1 hour
      path: '/',
      sameSite: 'strict',
    });

    return NextResponse.json({ message: 'Logged in successfully', role: user.role });

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
