import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EvaluationForm } from './components/EvaluationForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EvaluationSummary, EvaluationSubmission } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'admin'>('form');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [evaluations, setEvaluations] = useState<EvaluationSubmission[]>([]);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [gsheetsConfig, setGsheetsConfig] = useState<{
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSyncedAt?: string;
  }>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch Evaluations & Summary Statistics
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/evaluations');
      const data = await res.json();
      if (data.success) {
        setEvaluations(data.data);
        setSummary(data.summary);
        setGsheetsConfig(data.gsheets || {});
      }
    } catch (err) {
      console.error('Failed to fetch evaluation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectView = (view: 'form' | 'admin') => {
    if (view === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentView('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      setCurrentView('form');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsLoginModalOpen(false);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentView('form');
  };

  const handleSeedData = async () => {
    try {
      const res = await fetch('/api/evaluations/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvaluations(data.data);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to seed data:', err);
    }
  };

  const handleClearData = async () => {
    try {
      const res = await fetch('/api/evaluations', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEvaluations([]);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEvaluations(data.data);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleSyncGSheets = async () => {
    const res = await fetch('/api/gsheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId: gsheetsConfig.spreadsheetId }),
    });
    const data = await res.json();
    if (data.success) {
      setGsheetsConfig({
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl,
        lastSyncedAt: data.lastSyncedAt,
      });
      return data;
    } else {
      throw new Error(data.message || 'ไม่สามารถบันทึกลง Google Sheets ได้');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        isAdminAuthenticated={isAdminAuthenticated}
        onSelectView={handleSelectView}
        onAdminLogout={handleAdminLogout}
        gsheetUrl={gsheetsConfig.spreadsheetUrl}
        onRefreshData={fetchData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'form' ? (
          <EvaluationForm
            onSubmitSuccess={fetchData}
            onGoToDashboard={() => handleSelectView('admin')}
          />
        ) : (
          summary && (
            <AdminDashboard
              summary={summary}
              evaluations={evaluations}
              gsheetsConfig={gsheetsConfig}
              onRefreshData={fetchData}
              onSeedData={handleSeedData}
              onClearData={handleClearData}
              onDeleteRecord={handleDeleteRecord}
              onSyncGSheets={handleSyncGSheets}
            />
          )
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} แบบประเมินความพึงพอใจโครงการเรียนรู้นอกห้องเรียน ชั้นมัธยมศึกษาปีที่ 2
          </p>
          <p className="text-slate-500">
            ระบบสนับสนุนการตัดสินใจและวิเคราะห์ข้อมูลด้วย Google Sheets API & PDF Report Generator
          </p>
        </div>
      </footer>
    </div>
  );
}
