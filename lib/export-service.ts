import { DashboardData, ProductivityMetrics, WritingSession } from '@/types/analytics';
import { formatNumber } from '@/lib/text-stats';

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Exportar dados como CSV
  exportToCsv(dashboardData: DashboardData, filename: string = 'relatorio-produtividade'): void {
    const csvContent = this.generateCsvContent(dashboardData);
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  // Gerar conteúdo CSV
  private generateCsvContent(data: DashboardData): string {
    const { metrics, recentActivity, achievements, insights } = data;
    
    let csv = 'Relatório de Produtividade de Escrita\n\n';
    
    // Métricas principais
    csv += 'MÉTRICAS PRINCIPAIS\n';
    csv += 'Métrica,Valor\n';
    csv += `Total de Palavras,${formatNumber(metrics.totalWords)}\n`;
    csv += `Total de Notas,${metrics.totalNotes}\n`;
    csv += `Dias Ativos,${metrics.activeDays}\n`;
    csv += `Streak Atual,${metrics.currentStreak} dias\n`;
    csv += `Melhor Streak,${metrics.longestStreak} dias\n`;
    csv += `Média de Palavras por Dia,${formatNumber(Math.round(metrics.averageWordsPerDay))}\n`;
    csv += `Meta Diária,${metrics.dailyGoal} palavras\n`;
    csv += `Progresso da Meta,${Math.round(metrics.dailyGoalProgress)}%\n`;
    csv += `Melhor Dia,${metrics.bestDay.date} (${formatNumber(metrics.bestDay.wordCount)} palavras)\n`;
    csv += `Palavras esta Semana,${formatNumber(metrics.thisWeekWords)}\n`;
    csv += `Palavras este Mês,${formatNumber(metrics.thisMonthWords)}\n\n`;

    // Atividade recente
    csv += 'ATIVIDADE RECENTE\n';
    csv += 'Data,Palavras,Notas Criadas,Notas Atualizadas\n';
    recentActivity.forEach(activity => {
      const date = new Date(activity.date).toLocaleDateString('pt-BR');
      csv += `${date},${activity.wordCount},${activity.notesCreated},${activity.notesUpdated}\n`;
    });
    csv += '\n';

    // Conquistas
    csv += 'CONQUISTAS\n';
    csv += 'Título,Descrição,Progresso,Status\n';
    achievements.forEach(achievement => {
      const status = achievement.unlockedAt ? 'Desbloqueada' : 'Em Progresso';
      const progress = `${achievement.progress}/${achievement.maxProgress}`;
      csv += `"${achievement.title}","${achievement.description}",${progress},${status}\n`;
    });
    csv += '\n';

    // Insights
    csv += 'INSIGHTS DE ESCRITA\n';
    csv += 'Métrica,Valor\n';
    csv += `Estilo Predominante,${insights.predominantStyle}\n`;
    csv += `Nível de Leitura,${insights.readingLevel}\n`;
    csv += `Palavras por Parágrafo,${Math.round(insights.avgWordsPerParagraph)}\n`;
    csv += `Palavras por Frase,${Math.round(insights.avgSentenceLength)}\n\n`;

    // Palavras mais usadas
    csv += 'PALAVRAS MAIS USADAS\n';
    csv += 'Palavra,Frequência\n';
    insights.mostUsedWords.forEach(word => {
      csv += `${word.word},${word.count}\n`;
    });

    return csv;
  }

  // Exportar relatório PDF (usando HTML para imprimir)
  exportToPdf(dashboardData: DashboardData, filename: string = 'relatorio-produtividade'): void {
    const htmlContent = this.generatePdfContent(dashboardData);
    
    // Criar uma nova janela para imprimir
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print();
        // Fechar a janela após a impressão (opcional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
  }

  // Gerar conteúdo HTML para PDF
  private generatePdfContent(data: DashboardData): string {
    const { metrics, recentActivity, achievements, insights } = data;
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Produtividade - ${currentDate}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333; 
          line-height: 1.4;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #3b82f6; 
          padding-bottom: 20px; 
        }
        .header h1 { 
          color: #3b82f6; 
          margin: 0; 
          font-size: 28px; 
        }
        .header p { 
          margin: 5px 0; 
          color: #666; 
        }
        .section { 
          margin-bottom: 25px; 
          page-break-inside: avoid; 
        }
        .section h2 { 
          color: #3b82f6; 
          border-left: 4px solid #3b82f6; 
          padding-left: 10px; 
          margin-bottom: 15px; 
        }
        .metrics-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 20px; 
        }
        .metric-card { 
          border: 1px solid #e5e7eb; 
          padding: 15px; 
          border-radius: 8px; 
          background: #f9fafb; 
        }
        .metric-card h3 { 
          margin: 0 0 8px 0; 
          color: #374151; 
          font-size: 14px; 
          text-transform: uppercase; 
        }
        .metric-card .value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #3b82f6; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px; 
        }
        th, td { 
          border: 1px solid #e5e7eb; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold; 
        }
        .achievement { 
          display: flex; 
          align-items: center; 
          margin-bottom: 10px; 
          padding: 10px; 
          border: 1px solid #e5e7eb; 
          border-radius: 6px; 
        }
        .achievement.unlocked { 
          background-color: #dcfce7; 
          border-color: #16a34a; 
        }
        .achievement-icon { 
          font-size: 20px; 
          margin-right: 10px; 
        }
        .achievement-details h4 { 
          margin: 0; 
          font-size: 14px; 
        }
        .achievement-details p { 
          margin: 2px 0; 
          font-size: 12px; 
          color: #666; 
        }
        .progress-bar { 
          width: 100px; 
          height: 6px; 
          background-color: #e5e7eb; 
          border-radius: 3px; 
          overflow: hidden; 
          margin-left: auto; 
        }
        .progress-fill { 
          height: 100%; 
          background-color: #3b82f6; 
        }
        .insight-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
        }
        .word-tags { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 5px; 
          margin-top: 10px; 
        }
        .word-tag { 
          background-color: #dbeafe; 
          color: #1e40af; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
        }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Relatório de Produtividade</h1>
        <p>Gerado em ${currentDate}</p>
        <p>Análise completa da sua produtividade de escrita</p>
      </div>

      <div class="section">
        <h2>📈 Métricas Principais</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>📝 Total de Palavras</h3>
            <div class="value">${formatNumber(metrics.totalWords)}</div>
          </div>
          <div class="metric-card">
            <h3>📚 Total de Notas</h3>
            <div class="value">${metrics.totalNotes}</div>
          </div>
          <div class="metric-card">
            <h3>📅 Dias Ativos</h3>
            <div class="value">${metrics.activeDays}</div>
          </div>
          <div class="metric-card">
            <h3>🔥 Streak Atual</h3>
            <div class="value">${metrics.currentStreak} dias</div>
          </div>
          <div class="metric-card">
            <h3>🏆 Melhor Streak</h3>
            <div class="value">${metrics.longestStreak} dias</div>
          </div>
          <div class="metric-card">
            <h3>⚡ Melhor Dia</h3>
            <div class="value">${formatNumber(metrics.bestDay.wordCount)} palavras</div>
            <small>${metrics.bestDay.date ? new Date(metrics.bestDay.date).toLocaleDateString('pt-BR') : 'N/A'}</small>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Estatísticas de Período</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Esta Semana</h3>
            <div class="value">${formatNumber(metrics.thisWeekWords)} palavras</div>
          </div>
          <div class="metric-card">
            <h3>Este Mês</h3>
            <div class="value">${formatNumber(metrics.thisMonthWords)} palavras</div>
          </div>
          <div class="metric-card">
            <h3>Média Diária</h3>
            <div class="value">${formatNumber(Math.round(metrics.averageWordsPerDay))} palavras</div>
          </div>
          <div class="metric-card">
            <h3>Meta Diária</h3>
            <div class="value">${metrics.dailyGoal} palavras</div>
            <small>Progresso: ${Math.round(metrics.dailyGoalProgress)}%</small>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🏅 Conquistas</h2>
        ${achievements.map(achievement => `
          <div class="achievement ${achievement.unlockedAt ? 'unlocked' : ''}">
            <div class="achievement-icon">${achievement.unlockedAt ? achievement.icon : '🔒'}</div>
            <div class="achievement-details">
              <h4>${achievement.title}</h4>
              <p>${achievement.description}</p>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>🧠 Insights de Escrita</h2>
        <div class="insight-grid">
          <div>
            <h3>Análise de Estilo</h3>
            <p><strong>Estilo Predominante:</strong> ${insights.predominantStyle}</p>
            <p><strong>Nível de Leitura:</strong> ${insights.readingLevel}</p>
            <p><strong>Palavras por Parágrafo:</strong> ${Math.round(insights.avgWordsPerParagraph)}</p>
            <p><strong>Palavras por Frase:</strong> ${Math.round(insights.avgSentenceLength)}</p>
          </div>
          <div>
            <h3>Palavras Mais Usadas</h3>
            <div class="word-tags">
              ${insights.mostUsedWords.slice(0, 10).map(word => 
                `<span class="word-tag">${word.word} (${word.count})</span>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📈 Atividade Recente</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Palavras</th>
              <th>Notas Criadas</th>
              <th>Notas Atualizadas</th>
            </tr>
          </thead>
          <tbody>
            ${recentActivity.slice(0, 15).map(activity => `
              <tr>
                <td>${new Date(activity.date).toLocaleDateString('pt-BR')}</td>
                <td>${formatNumber(activity.wordCount)}</td>
                <td>${activity.notesCreated}</td>
                <td>${activity.notesUpdated}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
        <p>Relatório gerado automaticamente pelo Notas App</p>
        <p>Continue escrevendo e acompanhe seu progresso! 📝✨</p>
      </div>
    </body>
    </html>
    `;
  }

  // Função auxiliar para download de arquivos
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  // Exportar apenas métricas básicas (JSON)
  exportToJson(dashboardData: DashboardData, filename: string = 'dados-produtividade'): void {
    const jsonContent = JSON.stringify(dashboardData, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  // Gerar relatório de período específico
  generatePeriodReport(dashboardData: DashboardData, startDate: Date, endDate: Date): string {
    const { recentActivity, metrics } = dashboardData;
    
    // Filtrar atividades por período
    const periodActivity = recentActivity.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });

    const totalWords = periodActivity.reduce((sum, activity) => sum + activity.wordCount, 0);
    const totalNotes = periodActivity.reduce((sum, activity) => sum + activity.notesCreated, 0);
    const activeDays = periodActivity.length;
    
    let report = `Relatório do Período: ${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}\n\n`;
    report += `Total de Palavras: ${formatNumber(totalWords)}\n`;
    report += `Total de Notas: ${totalNotes}\n`;
    report += `Dias Ativos: ${activeDays}\n`;
    report += `Média de Palavras por Dia: ${activeDays > 0 ? formatNumber(Math.round(totalWords / activeDays)) : 0}\n\n`;
    
    report += 'Detalhamento por Dia:\n';
    periodActivity.forEach(activity => {
      const date = new Date(activity.date).toLocaleDateString('pt-BR');
      report += `${date}: ${activity.wordCount} palavras, ${activity.notesCreated} notas criadas\n`;
    });
    
    return report;
  }
}

export const exportService = ExportService.getInstance(); 