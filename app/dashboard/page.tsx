import { Dashboard } from '@/components/ui/dashboard';
import AppLayout from '@/components/layout/AppLayout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto notion-scrollbar">
        <div className="p-6">
          <Dashboard />
        </div>
      </div>
    </AppLayout>
  );
}

export const metadata = {
  title: 'Dashboard de Produtividade | Notas App',
  description: 'Acompanhe seu progresso e insights de escrita',
}; 