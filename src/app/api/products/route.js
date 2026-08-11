import { NextResponse } from 'next/server';
import { readProducts, readAllProducts, writeProducts } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });

    const products = readProducts(userId);
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno ao carregar produtos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, niche, url, description, image, userId } = await request.json();
    if (!name || !userId) {
      return NextResponse.json({ error: 'Nome e userId são obrigatórios' }, { status: 400 });
    }

    const allProducts = readAllProducts();
    const newProduct = {
      id: Date.now().toString(),
      name,
      niche: niche || 'Geral',
      url: url || '',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop', // default placeholder
      userId,
      createdAt: new Date().toISOString()
    };

    allProducts.push(newProduct);
    writeProducts(allProducts);

    return NextResponse.json(newProduct);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao salvar produto' }, { status: 500 });
  }
}
