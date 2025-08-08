import { Report, AnalysisResult } from '@/types/report';

const REPORTS_STORAGE_KEY = 'mvp-blocks-reports';
const ANALYSIS_STORAGE_KEY = 'mvp-blocks-analysis';

export class ReportStorage {
  static saveReport(report: Report): void {
    const reports = this.getAllReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    
    if (existingIndex >= 0) {
      reports[existingIndex] = { ...report, updatedAt: Date.now() };
    } else {
      reports.push(report);
    }
    
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }

  static getAllReports(): Report[] {
    try {
      const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getReport(id: string): Report | null {
    const reports = this.getAllReports();
    return reports.find(r => r.id === id) || null;
  }

  static deleteReport(id: string): void {
    const reports = this.getAllReports().filter(r => r.id !== id);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }

  static clearAllReports(): void {
    localStorage.removeItem(REPORTS_STORAGE_KEY);
  }

  static saveAnalysis(analysis: AnalysisResult): void {
    const analyses = this.getAllAnalyses();
    analyses.push(analysis);
    localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analyses));
  }

  static getAllAnalyses(): AnalysisResult[] {
    try {
      const stored = localStorage.getItem(ANALYSIS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearAllAnalyses(): void {
    localStorage.removeItem(ANALYSIS_STORAGE_KEY);
  }

  static exportReportAsMarkdown(report: Report): string {
    const metadata = `---
title: ${report.title}
category: ${report.category}
tags: ${report.tags.join(', ')}
created: ${new Date(report.createdAt).toISOString()}
updated: ${new Date(report.updatedAt).toISOString()}
---

`;
    return metadata + report.content;
  }

  static downloadReport(report: Report, format: 'md' | 'txt' = 'md'): void {
    const content = format === 'md' 
      ? this.exportReportAsMarkdown(report)
      : report.content;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}