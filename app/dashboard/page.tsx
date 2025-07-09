'use client';

import React, { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

// ✅ Lazy loading do Dashboard - carregamento sob demanda
const Dashboard = React.lazy(() => import('@/components/ui/dashboard').then(module => ({ default: module.Dashboard })));

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto notion-scrollbar">
        <div className="p-6">
          {/* ✅ Suspense wrapper com skeleton elegante */}
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
} 