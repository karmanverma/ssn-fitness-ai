'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { ReportStorage } from '@/lib/report-storage';
import { Report } from '@/types/report';
import { 
  Download, 
  Share, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Tag, 
  Clock,
  Edit3,
  Trash2,
  Plus,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();
  const { 
    currentReport, 
    reports, 
    generateReport, 
    updateReport, 
    deleteReport,
    isGeneratingReport 
  } = useEnhancedAIAssistant();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [newReportTitle, setNewReportTitle] = useState('');
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);

  // Set current report or latest report
  useEffect(() => {
    if (currentReport) {
      setSelectedReport(currentReport);
    } else if (reports.length > 0) {
      setSelectedReport(reports[reports.length - 1]);
    }
  }, [currentReport, reports]);

  const handleDownload = (report: Report) => {
    ReportStorage.downloadReport(report, 'md');
  };

  const handleWhatsAppShare = (report: Report) => {
    const text = `Check out this report: ${report.title}\n\n${report.content.substring(0, 200)}...`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleUpdateReport = () => {
    if (selectedReport && editInstructions.trim()) {
      updateReport(selectedReport.id, editInstructions);
      setIsEditing(false);
      setEditInstructions('');
    }
  };

  const handleCreateNewReport = () => {
    if (newReportTitle.trim()) {
      generateReport(newReportTitle);
      setShowNewReportDialog(false);
      setNewReportTitle('');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - you can enhance this with a proper markdown library
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 text-foreground">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  if (reports.length === 0 && !isGeneratingReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">No Reports Yet</h1>
          <p className="text-muted-foreground mb-6">
            Start a conversation with the AI assistant and ask for reports, analysis, or summaries.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Start Conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold">Reports</h1>
                <p className="text-sm text-muted-foreground">
                  {reports.length} report{reports.length !== 1 ? 's' : ''} generated
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedReport && (
                <>
                  <button
                    onClick={() => handleDownload(selectedReport)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleWhatsAppShare(selectedReport)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                    title="Share via WhatsApp"
                  >
                    <Share className="h-4 w-4" />
                    WhatsApp
                  </button>
                </>
              )}
              <button
                onClick={() => setShowNewReportDialog(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">All Reports</h2>
              <div className="space-y-2">
                {reports.map((report) => (
                  <motion.button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border transition-all',
                      selectedReport?.id === report.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20'
                        : 'border-border hover:border-rose-300 hover:bg-muted/50'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{report.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(report.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs',
                        report.category === 'analysis' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        report.category === 'technical' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                        report.category === 'business' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      )}>
                        {report.category}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{selectedReport.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedReport.createdAt)}
                      </div>
                      {selectedReport.metadata && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedReport.metadata.estimatedReadTime} min read
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {selectedReport.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Update report"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReport(selectedReport.id)}
                      className="p-2 rounded-lg hover:bg-muted text-red-500 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {selectedReport.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Report Content */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: `<p class="mb-4">${renderMarkdown(selectedReport.content)}</p>` 
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a report to view its content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Report Dialog */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Update Report</h3>
                  <textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="Enter instructions for updating the report..."
                    className="w-full h-32 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateReport}
                      disabled={!editInstructions.trim()}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Update Report
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* New Report Dialog */}
      <AnimatePresence>
        {showNewReportDialog && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewReportDialog(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Generate New Report</h3>
                  <input
                    type="text"
                    value={newReportTitle}
                    onChange={(e) => setNewReportTitle(e.target.value)}
                    placeholder="Enter report title..."
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewReport()}
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowNewReportDialog(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNewReport}
                      disabled={!newReportTitle.trim()}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}