'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Table, Database, Calendar } from 'lucide-react';
import { DashboardData } from '@/types/note';
import { exportService } from '@/lib/export-service';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData;
}

interface ExportFormat {
  id: 'pdf' | 'csv' | 'json';
  name: string;
  description: string;
  icon: React.ReactNode;
  action: (data: DashboardData, filename: string) => void;
}

export default function ExportModal({ isOpen, onClose, dashboardData }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Relatório completo formatado para impressão',
      icon: <FileText className="h-6 w-6" />,
      action: (data, filename) => exportService.exportToPdf(data, filename)
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Dados tabulares para análise em planilhas',
      icon: <Table className="h-6 w-6" />,
      action: (data, filename) => exportService.exportToCsv(data, filename)
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Dados brutos para integração técnica',
      icon: <Database className="h-6 w-6" />,
      action: (data, filename) => exportService.exportToJson(data, filename)
    }
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      const filename = customFilename || `relatorio-produtividade-${new Date().toISOString().split('T')[0]}`;
      
      // Se for um período personalizado, filtrar os dados
      let dataToExport = dashboardData;
      
      if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        
        // Filtrar atividade recente
        dataToExport = {
          ...dashboardData,
          recentActivity: dashboardData.recentActivity.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= startDate && activityDate <= endDate;
          })
        };
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        dataToExport = {
          ...dashboardData,
          recentActivity: dashboardData.recentActivity.filter(activity => {
            return new Date(activity.date) >= weekAgo;
          })
        };
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        dataToExport = {
          ...dashboardData,
          recentActivity: dashboardData.recentActivity.filter(activity => {
            return new Date(activity.date) >= monthAgo;
          })
        };
      }
      
      await format.action(dataToExport, filename);
      
      // Feedback visual
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setIsExporting(false);
    }
  };

  const getDefaultFilename = () => {
    const date = new Date().toISOString().split('T')[0];
    let period = '';
    
    switch (selectedPeriod) {
      case 'week':
        period = '-ultima-semana';
        break;
      case 'month':
        period = '-ultimo-mes';
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          period = `-${customStartDate}-${customEndDate}`;
        }
        break;
      default:
        period = '-completo';
    }
    
    return `relatorio-produtividade${period}-${date}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Exportar Relatório
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seleção de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="h-4 w-4 inline mr-2" />
              Período dos Dados
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Todos os dados' },
                { value: 'month', label: 'Último mês' },
                { value: 'week', label: 'Última semana' },
                { value: 'custom', label: 'Período personalizado' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value={option.value}
                    checked={selectedPeriod === option.value}
                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {selectedPeriod === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data inicial</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data final</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nome do Arquivo */}
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do arquivo
            </label>
            <input
              type="text"
              id="filename"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={getDefaultFilename()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe vazio para usar o nome padrão
            </p>
          </div>

          {/* Formatos de Exportação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Formato de exportação
            </label>
            <div className="space-y-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {format.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {format.description}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isExporting && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Gerando relatório...
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
} 