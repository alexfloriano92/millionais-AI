import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers } from '@/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    const users = readUsers();
    if (users.find(u => u.email === email)) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), name, email, password: hashedPassword, createdAt: new Date().toISOString() };
    users.push(user);
    writeUsers(users);

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
