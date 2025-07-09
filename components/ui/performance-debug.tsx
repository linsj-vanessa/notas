'use client';

import { useState, useEffect } from 'react';
import { Card } from './card';
import { Button } from './button';
import { analyticsService } from '@/lib/analytics';

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  lastCalculationTime: number;
  cacheSize: number;
}

export const PerformanceDebug = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    lastCalculationTime: 0,
    cacheSize: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Escutar logs de performance do console
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('🚀 Usando dados do dashboard do cache!')) {
        setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
      } else if (message.includes('📊 Gerando dados do dashboard')) {
        setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
      } else if (message.includes('Dashboard completo gerado em')) {
        const timeMatch = message.match(/(\d+)ms/);
        if (timeMatch) {
          setMetrics(prev => ({ ...prev, lastCalculationTime: parseInt(timeMatch[1]) }));
        }
      }
      
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const clearCache = () => {
    analyticsService.clearCache();
    setMetrics({
      cacheHits: 0,
      cacheMisses: 0,
      lastCalculationTime: 0,
      cacheSize: 0,
    });
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 z-50"
        title="Mostrar debug de performance"
      >
        🔧
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 z-50 min-w-[300px] bg-background/95 backdrop-blur-sm border shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">⚡ Performance Debug</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Cache Hits:</span>
          <span className="text-green-600 font-mono">{metrics.cacheHits}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Miss:</span>
          <span className="text-red-600 font-mono">{metrics.cacheMisses}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Último Cálculo:</span>
          <span className="font-mono">{metrics.lastCalculationTime}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span>Hit Rate:</span>
          <span className="font-mono">
            {metrics.cacheHits + metrics.cacheMisses > 0 
              ? Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100)
              : 0}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearCache}
          className="w-full text-xs"
        >
          🗑️ Limpar Cache
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Cache acelera carregamento do dashboard
        </div>
      </div>
    </Card>
  );
}; 