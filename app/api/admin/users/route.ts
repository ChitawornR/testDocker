import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

interface UserPacket extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// GET all users except the current admin
export async function GET(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');
    const userId = req.headers.get('x-user-id');

    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [users] = await pool.query<UserPacket[]>(
      'SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE deletedAt IS NULL AND id != ?',
      [userId]
    );

    return NextResponse.json(users);

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}

// POST a new user
export async function POST(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    // You might want to get the inserted user and return it
    // For now, let's just return a success message
    return NextResponse.json({ message: 'User created successfully', userId: (result as any).insertId }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}

// PUT (update) a user
export async function PUT(req: Request) {
    try {
      const userRole = req.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
  
      const { id, name, email, role } = await req.json();
  
      if (!id || !name || !email || !role) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
      }
  
      await pool.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
  
      return NextResponse.json({ message: 'User updated successfully' });
  
    } catch (error: any) {
      console.error(error);
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
      }
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
    }
  }
  
  // DELETE a user (soft delete)
  export async function DELETE(req: Request) {
    try {
      const userRole = req.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
  
      const { id } = await req.json();
  
      if (!id) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }
  
      await pool.query(
        'UPDATE users SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
  
      return NextResponse.json({ message: 'User deleted successfully' });
  
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
    }
  }
  
