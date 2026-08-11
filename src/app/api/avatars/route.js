import { NextResponse } from 'next/server';
import { readAvatars, readAllAvatars, writeAvatars } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });

    const avatars = readAvatars(userId);
    return NextResponse.json(avatars);
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno ao carregar avatares' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, image, userId } = await request.json();
    if (!name || !image || !userId) {
      return NextResponse.json({ error: 'Nome, imagem e userId são obrigatórios' }, { status: 400 });
    }

    const allAvatars = readAllAvatars();
    const newAvatar = {
      id: Date.now().toString(),
      name,
      image,
      userId,
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    allAvatars.push(newAvatar);
    writeAvatars(allAvatars);

    return NextResponse.json(newAvatar);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar avatar' }, { status: 500 });
  }
}
