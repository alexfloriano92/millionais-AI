import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { readUsers } from '@/lib/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
