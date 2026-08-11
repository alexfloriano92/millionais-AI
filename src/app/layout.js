import './globals.css';

export const metadata = {
  title: 'Millionais AI — Crie conteúdo de produto com IA',
  description: 'Plataforma completa de criação de conteúdo com IA para TikTok Shop e e-commerce. Vídeos UGC, imagens de produto, voz, legendas, agentes e análise de virais.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
