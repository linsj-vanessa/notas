'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Clock, Calendar, TestTube, Volume2 } from 'lucide-react';
import { useNotifications } from '@/lib/notification-service';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  enabled: boolean;
  time: string;
  frequency: 'daily' | 'custom';
  customDays: number[];
  message: string;
  reminderInterval: number;
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const notifications = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '18:00',
    frequency: 'daily',
    customDays: [1, 2, 3, 4, 5],
    message: 'Que tal escrever algumas palavras hoje? ✍️',
    reminderInterval: 2,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentSettings = notifications.getSettings();
      setSettings(currentSettings);
      setHasPermission(notifications.hasPermission());
      setIsSupported(notifications.isSupported());
    }
  }, [isOpen, notifications]);

  const handleSave = () => {
    notifications.updateSettings(settings);
    onClose();
  };

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      const granted = await notifications.enableNotifications();
      if (granted) {
        setSettings(prev => ({ ...prev, enabled: true }));
        setHasPermission(true);
      }
    } else {
      notifications.disableNotifications();
      setSettings(prev => ({ ...prev, enabled: false }));
    }
  };

  const handleDayToggle = (day: number) => {
    setSettings(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day].sort()
    }));
  };

  const handleTestNotification = () => {
    notifications.testNotification();
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurações de Notificações
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
          {/* Suporte a Notificações */}
          {!isSupported && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                <BellOff className="h-5 w-5" />
                <span className="font-medium">Notificações não suportadas</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Seu navegador não suporta notificações ou elas estão desabilitadas.
              </p>
            </div>
          )}

          {/* Toggle Principal */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Ativar Notificações
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receba lembretes para manter sua rotina de escrita
              </p>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={!isSupported}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                settings.enabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enabled && hasPermission && (
            <>
              {/* Horário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Horário do Lembrete
                </label>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escolha o melhor horário para receber lembretes de escrita
                </p>
              </div>

              {/* Frequência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Frequência
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={settings.frequency === 'daily'}
                      onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'custom' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Todos os dias</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="custom"
                      checked={settings.frequency === 'custom'}
                      onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'custom' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dias personalizados</span>
                  </label>
                </div>

                {settings.frequency === 'custom' && (
                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayToggle(index)}
                        className={`p-2 text-xs font-medium rounded-md transition-colors ${
                          settings.customDays.includes(index)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Intervalo de Lembretes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalo entre Lembretes
                </label>
                <select
                  value={settings.reminderInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderInterval: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={6}>6 horas</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tempo entre lembretes se você ainda não escreveu
                </p>
              </div>

              {/* Teste de Notificação */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Testar Notificação
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Envie uma notificação de teste para verificar se está funcionando
                    </p>
                  </div>
                  <button
                    onClick={handleTestNotification}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <TestTube className="h-4 w-4" />
                    Testar
                  </button>
                </div>
              </div>
            </>
          )}

          {settings.enabled && !hasPermission && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                <BellOff className="h-5 w-5" />
                <span className="font-medium">Permissão Negada</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                As notificações estão bloqueadas. Para receber lembretes, você precisa permitir notificações nas configurações do navegador.
              </p>
              <button
                onClick={handleToggleNotifications}
                className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Dicas */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              💡 Dicas para Notificações
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Escolha um horário que funcione na sua rotina</li>
              <li>• As notificações param automaticamente depois que você escreve</li>
              <li>• Você pode desativar a qualquer momento</li>
              <li>• Clique na notificação para ir direto ao app</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
} 