import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'time1234') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">เข้าสู่ระบบผู้ดูแลระบบ (Admin)</h3>
            <p className="text-xs text-slate-500 mt-1">
              กรุณากรอกรหัสผ่านเพื่อเข้าสู่แดชบอร์ดสรุปผลและรายงาน PDF
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                รหัสผ่านผู้ดูแลระบบ
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="กรอกรหัสผ่าน"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-medium text-sm transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
