import React from 'react';
import { Award, FileText, BarChart3, Lock, LogOut, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'form' | 'admin';
  isAdminAuthenticated: boolean;
  onSelectView: (view: 'form' | 'admin') => void;
  onAdminLogout: () => void;
  gsheetUrl?: string;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  isAdminAuthenticated,
  onSelectView,
  onAdminLogout,
  gsheetUrl,
  onRefreshData,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('form')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  ระดับชั้นมัธยมศึกษาปีที่ 2
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 line-clamp-1 mt-0.5">
                โครงการเรียนรู้นอกห้องเรียน ม.2
              </h1>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {gsheetUrl && (
              <a
                href={gsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-all shadow-sm"
                title="เปิด Google Sheets สรุปผล"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
              </a>
            )}

            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg transition-all"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSelectView('form')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'form'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>แบบประเมิน</span>
            </button>

            <button
              onClick={() => onSelectView('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>แดชบอร์ดสรุปผล</span>
              {isAdminAuthenticated ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ) : (
                <Lock className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>

            {isAdminAuthenticated && currentView === 'admin' && (
              <button
                onClick={onAdminLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="ออกจากระบบผู้ดูแลระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
