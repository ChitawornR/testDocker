import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND deletedAt IS NULL',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
