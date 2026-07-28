import React, { useState } from 'react';
import {
  EvaluationSummary,
  EvaluationSubmission,
  CLASSROOM_OPTIONS,
  EVALUATION_CATEGORIES,
} from '../types';
import { PDFReportView } from './PDFReportView';
import { exportReportToPDF } from '../lib/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FileText,
  FileSpreadsheet,
  Download,
  RefreshCw,
  PlusCircle,
  Trash2,
  Users,
  CheckCircle2,
  ExternalLink,
  MessageSquareText,
  BarChart2,
  Table as TableIcon,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  summary: EvaluationSummary;
  evaluations: EvaluationSubmission[];
  gsheetsConfig?: {
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSyncedAt?: string;
  };
  onRefreshData: () => void;
  onSeedData: () => void;
  onClearData: () => void;
  onDeleteRecord?: (id: string) => void;
  onSyncGSheets: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  summary,
  evaluations,
  gsheetsConfig,
  onRefreshData,
  onSeedData,
  onClearData,
  onDeleteRecord,
  onSyncGSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'table' | 'suggestions' | 'records' | 'pdf'>('analytics');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSyncingGSheets, setIsSyncingGSheets] = useState(false);
  const [gsheetsMessage, setGsheetsMessage] = useState<string | null>(null);

  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Search and Filter states for Records tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportReportToPDF('pdf-report-container', 'รายงานผลการประเมินโครงการเรียนรู้นอกห้องเรียน_ม2.pdf');
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSyncGSheets = async () => {
    setIsSyncingGSheets(true);
    setGsheetsMessage(null);
    try {
      const res: any = await onSyncGSheets();
      const targetUrl = res?.spreadsheetUrl || gsheetsConfig?.spreadsheetUrl;
      setGsheetsMessage('บันทึกและซิงค์ข้อมูลลง Google Sheets สำเร็จเรียบร้อยแล้ว!');
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    } catch (err: any) {
      setGsheetsMessage(`ข้อผิดพลาด: ${err.message || 'ไม่สามารถซิงค์ได้'}`);
    } finally {
      setIsSyncingGSheets(false);
    }
  };

  // Prepare chart data
  const categoryChartData = summary.categorySummaries.map((cat) => ({
    name: cat.title.replace('หมวดที่ ', 'หมวด '),
    shortName: `หมวด ${cat.id}`,
    mean: cat.mean,
    sd: cat.sd,
  }));

  const itemChartData = summary.categorySummaries.flatMap((cat) =>
    cat.items.map((item) => ({
      name: `ข้อ ${item.id}`,
      fullQuestion: item.question,
      mean: item.mean,
      sd: item.sd,
    }))
  );

  const statusPieData = [
    { name: 'นักเรียน', value: summary.studentCount, color: '#3b82f6' },
    { name: 'ครูผู้สอน', value: summary.teacherCount, color: '#f59e0b' },
  ];

  const genderPieData = [
    { name: 'ชาย', value: summary.genderBreakdown.male, color: '#0284c7' },
    { name: 'หญิง', value: summary.genderBreakdown.female, color: '#ec4899' },
    { name: 'ไม่ระบุ', value: summary.genderBreakdown.unspecified, color: '#64748b' },
  ];

  const classroomChartData = CLASSROOM_OPTIONS.map((room) => ({
    room,
    mean: summary.classroomMean[room]?.mean || 0,
    count: summary.classroomMean[room]?.count || 0,
  }));

  // Filtered records
  const filteredRecords = evaluations.filter((item) => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.suggestions && item.suggestions.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRoom = filterClassroom === 'all' || item.classroom === filterClassroom;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesRoom && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Admin Top Action Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ระบบบริหารจัดการและสรุปผลผู้ดูแลระบบ (Admin Dashboard)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            สรุปผลการประเมินโครงการเรียนรู้นอกห้องเรียน ม.2
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleSyncGSheets}
            disabled={isSyncingGSheets}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isSyncingGSheets ? 'กำลังซิงค์...' : 'บันทึก/เปิด Google Sheets'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'กำลังสร้าง PDF...' : 'ส่งออกรายงาน PDF'}</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onSeedData}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
            title="สร้างข้อมูลตัวอย่างสำหรับทดสอบ"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>ข้อมูลตัวอย่าง</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="ล้างข้อมูลแบบประเมินทั้งหมด/ลบข้อมูลตัวอย่าง"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>ล้างข้อมูลตัวอย่าง/ทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Status & Link Banner */}
      {(gsheetsMessage || gsheetsConfig?.spreadsheetUrl) && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between flex-wrap gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{gsheetsMessage || 'เชื่อมต่อกับ Google Sheets เรียบร้อยแล้ว (อัปเดตข้อมูลอัตโนมัติเมื่อมีผู้ตอบแบบประเมิน)'}</span>
          </div>
          {gsheetsConfig?.spreadsheetUrl && (
            <a
              href={gsheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>เปิดสเปรดชีต Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          )}
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sample Size */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>ผู้ประเมินทั้งหมด (N)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {summary.totalCount}{' '}
            <span className="text-sm font-normal text-slate-400">คน</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>นักเรียน: <strong>{summary.studentCount}</strong></span>
            <span>|</span>
            <span>ครู: <strong>{summary.teacherCount}</strong></span>
          </div>
        </div>

        {/* Overall Mean Score */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>คะแนนเฉลี่ยรวม (Mean)</span>
            <BarChart2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">
              {summary.overallMean.toFixed(2)}
            </span>
            <span className="text-xs font-normal text-slate-400">/ 5.00</span>
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            ระดับ: {summary.overallLevel}
          </div>
        </div>

        {/* Overall Standard Deviation */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>ค่าเบี่ยงเบนมาตรฐาน (S.D.)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {summary.overallSD.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">ค่าการกระจายตัวต่ำ (ข้อมูลสม่ำเสมอ)</p>
        </div>

        {/* Google Sheets Sync Card */}
        <div className="bg-indigo-900 text-white rounded-xl p-5 shadow-sm border border-indigo-900 space-y-2">
          <div className="flex items-center justify-between text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <span>การเชื่อมโยง Google Sheets</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="text-sm font-bold text-white line-clamp-1">
            {gsheetsConfig?.spreadsheetId ? 'เชื่อมต่อเรียบร้อยแล้ว' : 'พร้อมบันทึกอัตโนมัติ'}
          </div>
          {gsheetsConfig?.spreadsheetUrl ? (
            <a
              href={gsheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-200 hover:text-white underline pt-1"
            >
              <span>ดูตาราง Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={handleSyncGSheets}
              className="text-xs text-indigo-200 hover:text-white underline font-semibold"
            >
              คลิกเพื่อเริ่มบันทึกครั้งแรก
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>วิเคราะห์กราฟและมิติคะแนน</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'table'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>ตารางวิเคราะห์สรุปรายข้อ (10 ข้อ)</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>ข้อเสนอแนะเพิ่มเติม</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'records'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>รายการคำตอบทั้งหมด ({evaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'pdf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>พรีวิวและออกรายงาน PDF</span>
        </button>
      </div>

      {/* Tab 1: Analytics & Visualizations */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.categorySummaries.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    หมวดที่ {cat.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {cat.level}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{cat.title}</h3>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">ค่าเฉลี่ย (Mean)</span>
                    <span className="text-2xl font-bold text-indigo-900">{cat.mean.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">S.D.</span>
                    <span className="text-lg font-bold text-slate-700">{cat.sd.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Category & Questions Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Mean Comparison Bar Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                คะแนนเฉลี่ยจำแนกตามรายหมวด (3 หมวด)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} tickCount={6} />
                    <Tooltip
                      formatter={(val: any) => [`${val} คะแนน`, 'ค่าเฉลี่ย']}
                      labelFormatter={(label) => `หมวด: ${label}`}
                    />
                    <Bar dataKey="mean" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Individual Item Scores Bar Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                คะแนนเฉลี่ยจำแนกตามรายข้อ (ข้อ 1 - 10)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={itemChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} tickCount={6} />
                    <Tooltip
                      formatter={(val: any) => [`${val} คะแนน`, 'ค่าเฉลี่ย']}
                      labelFormatter={(label, payload) => {
                        const item = payload[0]?.payload;
                        return `${label}: ${item?.fullQuestion || ''}`;
                      }}
                    />
                    <Bar dataKey="mean" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Demographics & Classroom Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Pie */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">สัดส่วนผู้ประเมินตามสถานะ</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} คน`, 'จำนวน']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Pie */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">สัดส่วนผู้ประเมินตามเพศ</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderPieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} คน`, 'จำนวน']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Classroom Mean Bar Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">คะแนนเฉลี่ยจำแนกตามห้องเรียน ม.2</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classroomChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="room" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 5]} tickCount={6} />
                    <Tooltip formatter={(v: any) => [`${v} คะแนน`, 'ค่าเฉลี่ยห้อง']} />
                    <Bar dataKey="mean" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Detailed Table */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6 overflow-x-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">ตารางวิเคราะห์คะแนนประเมินรายข้อ (10 ข้อ)</h2>
            <p className="text-xs text-slate-500">
              วิเคราะห์จำนวนผู้ตอบแต่ละระดับคะแนน (5-1), ค่าเฉลี่ย (Mean), ค่าเบี่ยงเบนมาตรฐาน (S.D.) และระดับความพึงพอใจ
            </p>
          </div>

          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-3 w-12 text-center">ข้อ</th>
                <th className="p-3">รายการประเมิน</th>
                <th className="p-3 text-center">กระจายคะแนน (5,4,3,2,1)</th>
                <th className="p-3 text-center w-20">Mean</th>
                <th className="p-3 text-center w-20">S.D.</th>
                <th className="p-3 text-center w-32">ระดับ</th>
              </tr>
            </thead>
            <tbody>
              {summary.categorySummaries.map((cat) => (
                <React.Fragment key={cat.id}>
                  <tr className="bg-indigo-50/80 font-bold text-indigo-950 border-b border-slate-200">
                    <td colSpan={3} className="p-3">
                      {cat.title}
                    </td>
                    <td className="p-3 text-center text-indigo-900 font-extrabold">{cat.mean.toFixed(2)}</td>
                    <td className="p-3 text-center">{cat.sd.toFixed(2)}</td>
                    <td className="p-3 text-center">{cat.level}</td>
                  </tr>

                  {cat.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-center font-bold text-slate-700">{item.id}</td>
                      <td className="p-3 text-slate-800">{item.question}</td>
                      <td className="p-3 text-center font-mono text-xs text-slate-600">
                        [{item.scoreCounts[5]}, {item.scoreCounts[4]}, {item.scoreCounts[3]},{' '}
                        {item.scoreCounts[2]}, {item.scoreCounts[1]}]
                      </td>
                      <td className="p-3 text-center font-extrabold text-slate-900">{item.mean.toFixed(2)}</td>
                      <td className="p-3 text-center text-slate-600">{item.sd.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${item.levelBadgeColor}`}>
                          {item.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              <tr className="bg-indigo-900 text-white font-extrabold text-base">
                <td colSpan={3} className="p-4 text-right pr-6">
                  คะแนนเฉลี่ยรวมทุกข้อ (Overall Mean)
                </td>
                <td className="p-4 text-center text-amber-300">{summary.overallMean.toFixed(2)}</td>
                <td className="p-4 text-center text-indigo-200">{summary.overallSD.toFixed(2)}</td>
                <td className="p-4 text-center text-amber-300">{summary.overallLevel}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Suggestions List */}
      {activeTab === 'suggestions' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">ข้อเสนอแนะและอภิปรายผลเพิ่มเติม</h2>
            <p className="text-xs text-slate-500">รวบรวมข้อคิดเห็นและข้อเสนอแนะจากผู้ตอบแบบประเมิน</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {evaluations.filter((e) => e.suggestions).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">ยังไม่มีข้อเสนอแนะเพิ่มเติมในระบบ</div>
            ) : (
              evaluations
                .filter((e) => e.suggestions)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.status} ({item.classroom})</span>
                        <span>•</span>
                        <span>เพศ: {item.gender}</span>
                      </div>
                      <span className="font-mono text-slate-400">{new Date(item.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium pl-3 border-l-2 border-indigo-600">
                      "{item.suggestions}"
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Individual Records */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัส ID หรือ ข้อเสนอแนะ..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="นักเรียน">นักเรียน</option>
                <option value="ครู">ครู</option>
              </select>

              <select
                value={filterClassroom}
                onChange={(e) => setFilterClassroom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">ทุกห้องเรียน</option>
                {CLASSROOM_OPTIONS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3">รหัส ID</th>
                  <th className="p-3">วัน-เวลา</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3">เพศ</th>
                  <th className="p-3">ห้องเรียน</th>
                  <th className="p-3 text-center">คะแนนเฉลี่ย</th>
                  <th className="p-3">ข้อเสนอแนะ</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => {
                  const scores = Object.values(rec.ratings) as number[];
                  const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
                  return (
                    <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-semibold text-indigo-700">{rec.id}</td>
                      <td className="p-3 text-slate-500">{new Date(rec.createdAt).toLocaleString('th-TH')}</td>
                      <td className="p-3 font-medium text-slate-800">{rec.status}</td>
                      <td className="p-3 text-slate-600">{rec.gender}</td>
                      <td className="p-3 text-slate-700 font-medium">{rec.classroom}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{avg.toFixed(2)}</td>
                      <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">{rec.suggestions || '-'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setDeleteTargetId(rec.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: PDF Printable Preview Container */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">พรีวิวเอกสารรายงานสรุปผลการประเมิน (PDF)</h3>
              <p className="text-xs text-slate-500">
                เอกสารจัดรูปแบบตามแบบฟอร์มรายงานผลวิชาการ พร้อมช่องลงนามเสนอผู้บริหารโรงเรียน
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-slate-100 p-4 sm:p-6 rounded-xl border border-slate-200">
            <PDFReportView summary={summary} evaluationsCount={evaluations.length} />
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Data */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการล้างข้อมูลทั้งหมด</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณต้องการล้างข้อมูลแบบประเมินทั้งหมด (รวมถึงข้อมูลตัวอย่าง) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onClearData();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all shadow-md cursor-pointer"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Record */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบรายการ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณต้องการลบข้อมูลแบบประเมินรหัส <span className="font-mono font-bold text-indigo-600">{deleteTargetId}</span> หรือไม่?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (deleteTargetId) {
                    onDeleteRecord?.(deleteTargetId);
                    setDeleteTargetId(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all shadow-md cursor-pointer"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
