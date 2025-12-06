import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    (await cookies()).delete('token'); // Clear the token cookie
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
