import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard de Produtividade | Notas App',
  description: 'Acompanhe seu progresso e insights de escrita com analytics detalhados',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 