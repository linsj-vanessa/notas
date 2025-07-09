'use client';

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useNotesStore } from '@/lib/stores';
import { analyticsService } from '@/lib/analytics';
import { DashboardData, ProductivityMetrics } from '@/types/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/text-stats';
import ExportModal from './export-modal';
import NotificationSettingsModal from './notification-settings-modal';
import BackupModal from './backup-modal';

interface DashboardProps {
  className?: string;
}

export function Dashboard({ className = '' }: DashboardProps) {
  const { notes, loadNotes } = useNotesStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(500);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const memoizedDashboardData = useMemo(() => {
    if (notes.length > 0) {
      return analyticsService.generateDashboardData(notes);
    }
    return null;
  }, [notes]);

  useEffect(() => {
    setDashboardData(memoizedDashboardData);
    setIsLoading(false);
  }, [memoizedDashboardData]);

  const handlePeriodChange = useCallback((period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  }, []);

  const handleGoalChange = useCallback((goal: number) => {
    setDailyGoal(goal);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Comece a escrever!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Crie suas primeiras notas para ver suas estatísticas de produtividade
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controles do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Produtividade</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Acompanhe seu progresso e insights de escrita
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBackup(true)}
            >
              🛡️ Backup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(true)}
            >
              🔔 Notificações
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
            >
              📊 Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              ⚙️ Configurações
            </Button>
          </div>
          
          {/* Filtros de período */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Ano
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Palavras Totais"
          value={formatNumber(dashboardData.metrics.totalWords)}
          icon="📝"
          change={selectedPeriod === 'week' ? dashboardData.metrics.weeklyChange : dashboardData.metrics.monthlyChange}
          changeLabel={selectedPeriod === 'week' ? 'vs semana passada' : 'vs mês passado'}
        />
        <MetricCard
          title="Dias Ativos"
          value={dashboardData.metrics.activeDays.toString()}
          icon="📅"
          subtitle={`${dashboardData.metrics.currentStreak} dias consecutivos`}
        />
        <MetricCard
          title="Notas Criadas"
          value={dashboardData.metrics.totalNotes.toString()}
          icon="📚"
          subtitle="Total de notas"
        />
        <MetricCard
          title="Meta Diária"
          value={`${Math.round(dashboardData.metrics.dailyGoalProgress)}%`}
          icon="🎯"
          subtitle={`${dashboardData.metrics.dailyGoal} palavras/dia`}
          progress={dashboardData.metrics.dailyGoalProgress}
        />
      </div>

      {/* Streak e Recordes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🔥</span>
            Streaks de Escrita
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Streak Atual</span>
              <span className="text-2xl font-bold text-orange-500">
                {dashboardData.metrics.currentStreak} dias
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Melhor Streak</span>
              <span className="text-lg font-semibold">
                {dashboardData.metrics.longestStreak} dias
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Média por Dia</span>
              <span className="text-lg font-semibold">
                {formatNumber(Math.round(dashboardData.metrics.averageWordsPerDay))} palavras
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🏆</span>
            Seus Recordes
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Melhor Dia</span>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatNumber(dashboardData.metrics.bestDay.wordCount)} palavras
                </div>
                <div className="text-sm text-gray-500">
                  {dashboardData.metrics.bestDay.date ? 
                    new Date(dashboardData.metrics.bestDay.date).toLocaleDateString('pt-BR') : 
                    'Nenhum registro'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Esta Semana</span>
              <span className="text-lg font-semibold">
                {formatNumber(dashboardData.metrics.thisWeekWords)} palavras
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Este Mês</span>
              <span className="text-lg font-semibold">
                {formatNumber(dashboardData.metrics.thisMonthWords)} palavras
              </span>
            </div>
          </div>
        </Card>
      </div>



      {/* Atividade Recente */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span>
          Atividade Recente
        </h3>
        <RecentActivity activity={dashboardData.recentActivity} />
      </Card>

      {/* Modal de Configurações */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          dailyGoal={dailyGoal}
                     onDailyGoalChange={(goal: number) => {
             setDailyGoal(goal);
             analyticsService.setDailyGoal(goal);
             // Recarregar dados do dashboard
             if (notes.length > 0) {
               const data = analyticsService.generateDashboardData(notes);
               setDashboardData(data);
             }
           }}
        />
      )}

      {/* Modal de Exportação */}
      {showExportModal && dashboardData && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          dashboardData={dashboardData}
        />
      )}

      {/* Modal de Notificações */}
      {showNotifications && (
        <NotificationSettingsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Modal de Backup */}
      {showBackup && (
        <BackupModal
          isOpen={showBackup}
          onClose={() => setShowBackup(false)}
        />
      )}
    </div>
  );
}

// Componentes auxiliares
interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  progress?: number;
}

function MetricCard({ title, value, icon, change, changeLabel, subtitle, progress }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      {change !== undefined && changeLabel && (
        <div className="flex items-center gap-1 text-sm">
          <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-gray-500">{changeLabel}</span>
        </div>
      )}
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </Card>
  );
}







interface RecentActivityProps {
  activity: Array<{
    date: string;
    wordCount: number;
    notesCreated: number;
    notesUpdated: number;
  }>;
}

function RecentActivity({ activity }: RecentActivityProps) {
  if (activity.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>Nenhuma atividade recente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activity.map((day, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <div className="font-medium">
              {new Date(day.date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {day.notesCreated > 0 && `${day.notesCreated} nota${day.notesCreated > 1 ? 's' : ''} criada${day.notesCreated > 1 ? 's' : ''}`}
              {day.notesCreated > 0 && day.notesUpdated > 0 && ' • '}
              {day.notesUpdated > 0 && `${day.notesUpdated} atualização${day.notesUpdated > 1 ? 'ões' : ''}`}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatNumber(day.wordCount)} palavras</div>
            <div className="text-sm text-gray-500">
              {day.wordCount > 0 && `${Math.round(day.wordCount / 200)} min de leitura`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyGoal: number;
  onDailyGoalChange: (goal: number) => void;
}

function SettingsModal({ isOpen, onClose, dailyGoal, onDailyGoalChange }: SettingsModalProps) {
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  const handleSave = () => {
    onDailyGoalChange(tempGoal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Configurações</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Meta Diária de Palavras</label>
            <Input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Defina quantas palavras você quer escrever por dia
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Dicas</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Comece com uma meta alcançável (200-500 palavras)</li>
              <li>• Aumente gradualmente conforme desenvolve o hábito</li>
              <li>• Seja consistente ao invés de ambicioso demais</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
} 