import React, { useState } from 'react';
import {
  EVALUATION_CATEGORIES,
  PROJECT_OBJECTIVES,
  CLASSROOM_OPTIONS,
  EvaluatorStatus,
  Gender,
  ClassRoomOption,
} from '../types';
import { CheckCircle2, AlertCircle, Sparkles, Send, HelpCircle, GraduationCap, Users } from 'lucide-react';

interface EvaluationFormProps {
  onSubmitSuccess: () => void;
  onGoToDashboard: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSubmitSuccess, onGoToDashboard }) => {
  const [gender, setGender] = useState<Gender | ''>('');
  const [status, setStatus] = useState<EvaluatorStatus | ''>('');
  const [classroom, setClassroom] = useState<ClassRoomOption | ''>('');
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [suggestions, setSuggestions] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{ id: string; avgScore: number } | null>(null);

  // Handle Status Change
  const handleStatusChange = (newStatus: EvaluatorStatus) => {
    setStatus(newStatus);
    if (newStatus === 'ครู') {
      setClassroom('- (ครูผู้สอน)');
    } else if (classroom === '- (ครูผู้สอน)') {
      setClassroom('');
    }
  };

  const handleRatingChange = (itemId: number, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [itemId]: score,
    }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!gender) {
      setErrorMessage('กรุณาเลือกเพศของผู้ประเมิน');
      return;
    }
    if (!status) {
      setErrorMessage('กรุณาเลือกสถานะของผู้ประเมิน (ครู หรือ นักเรียน)');
      return;
    }
    if (status === 'นักเรียน' && !classroom) {
      setErrorMessage('กรุณาเลือกระดับชั้น/ห้องเรียนสำหรับนักเรียน');
      return;
    }

    // Check all 10 items rated
    const unratedItems: number[] = [];
    for (let i = 1; i <= 10; i++) {
      if (!ratings[i]) unratedItems.push(i);
    }

    if (unratedItems.length > 0) {
      setErrorMessage(`กรุณาให้คะแนนแบบประเมินให้ครบถ้วน (ยังขาดข้อที่: ${unratedItems.join(', ')})`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gender,
          status,
          classroom: status === 'ครู' ? '- (ครูผู้สอน)' : classroom,
          ratings,
          suggestions,
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        const scores = Object.values(ratings) as number[];
        const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
        setSubmittedData({
          id: resData.submission.id,
          avgScore,
        });
        onSubmitSuccess();
      } else {
        setErrorMessage(resData.message || 'ไม่สามารถส่งแบบประเมินได้');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGender('');
    setStatus('');
    setClassroom('');
    setRatings({});
    setSuggestions('');
    setSubmittedData(null);
    setErrorMessage(null);
  };

  if (submittedData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              ส่งแบบประเมินสำเร็จ (รหัส: {submittedData.id})
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              ขอบคุณสำหรับการประเมินความพึงพอใจ
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
              ข้อมูลของท่านถูกบันทึกเข้าสู่ระบบ และประมวลผลสรุปวิเคราะห์ร่วมกับ Google Sheets เรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              คะแนนความพึงพอใจเฉลี่ยของท่าน
            </span>
            <div className="text-4xl font-extrabold text-indigo-900">
              {submittedData.avgScore.toFixed(2)}{' '}
              <span className="text-base font-normal text-slate-500">/ 5.00</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all shadow-sm"
            >
              ทำแบบประเมินอีกครั้ง
            </button>
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ดูสรุปผลการประเมินภาพรวม</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title & Objectives Card */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-indigo-900 space-y-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-800 text-indigo-200 border border-indigo-700 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-300" />
            <span>แบบประเมินความพึงพอใจโครงการ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            โครงการเรียนรู้นอกห้องเรียน ชั้นมัธยมศึกษาปีที่ 2
          </h1>

          <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed max-w-3xl">
            คำชี้แจง: แบบประเมินนี้จัดทำขึ้นเพื่อสอบถามความพึงพอใจของนักเรียนและครูผู้ดูแลต่อการเข้าร่วมโครงการเรียนรู้นอกห้องเรียน ม.2
            เพื่อนำข้อมูลไปวิเคราะห์และพัฒนาการจัดกิจกรรมให้มีประสิทธิภาพดียิ่งขึ้น
          </p>

          {/* Objectives Box */}
          <div className="bg-indigo-800/80 border border-indigo-700/80 rounded-xl p-4 text-xs sm:text-sm space-y-2 mt-2">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>วัตถุประสงค์ของโครงการ (3 ข้อ)</span>
            </h2>
            <ul className="space-y-1 text-indigo-100 pl-1">
              {PROJECT_OBJECTIVES.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-200/80 pb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ส่วนที่ 1: ข้อมูลทั่วไปของผู้ประเมิน</h2>
              <p className="text-xs text-slate-500">เลือกเพศ สถานะ และระดับชั้น/ห้องเรียนของผู้ตอบแบบประเมิน</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gender Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                เพศ <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as Gender);
                  setErrorMessage(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 text-sm font-medium transition-all shadow-sm"
              >
                <option value="">-- เลือกเพศ --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                สถานะผู้ประเมิน <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => {
                  handleStatusChange(e.target.value as EvaluatorStatus);
                  setErrorMessage(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 text-sm font-medium transition-all shadow-sm"
              >
                <option value="">-- เลือกสถานะ --</option>
                <option value="นักเรียน">นักเรียน</option>
                <option value="ครู">ครู / ครูผู้ดูแล</option>
              </select>
            </div>

            {/* Conditional Classroom Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                ระดับชั้น / ห้องเรียน <span className="text-rose-500">*</span>
              </label>
              {status === 'ครู' ? (
                <div className="px-3.5 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>- (ครูผู้สอน / ผู้ดูแลโครงการ)</span>
                </div>
              ) : (
                <select
                  value={classroom}
                  onChange={(e) => {
                    setClassroom(e.target.value as ClassRoomOption);
                    setErrorMessage(null);
                  }}
                  disabled={status !== 'นักเรียน'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                >
                  <option value="">
                    {status === '' ? '-- กรุณาเลือกสถานะนักเรียนก่อน --' : '-- เลือกห้องเรียน (ม.2) --'}
                  </option>
                  {CLASSROOM_OPTIONS.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: 10 Evaluation Items across 3 categories */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-200/80 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ส่วนที่ 2: แบบประเมินความพึงพอใจ (10 ข้อ)
                </h2>
                <p className="text-xs text-slate-500">
                  โปรดให้คะแนนตามระดับความพึงพอใจจริง (5 = มากที่สุด, 1 = น้อยที่สุด)
                </p>
              </div>
            </div>

            {/* Score Legend */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
              <span className="font-semibold text-slate-800">เกณฑ์คะแนน:</span>
              <span>5=มากที่สุด</span>
              <span>|</span>
              <span>4=มาก</span>
              <span>|</span>
              <span>3=ปานกลาง</span>
              <span>|</span>
              <span>2=น้อย</span>
              <span>|</span>
              <span>1=น้อยที่สุด</span>
            </div>
          </div>

          {/* Render Categories & Items */}
          <div className="space-y-6">
            {EVALUATION_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="bg-slate-50 border-l-4 border-indigo-600 px-4 py-2 rounded-r-lg">
                  <h3 className="text-sm font-bold text-slate-900">{category.title}</h3>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => {
                    const selectedScore = ratings[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedScore
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Question Text */}
                          <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed pr-2">
                            {item.question}
                          </div>

                          {/* Rating Radio Buttons (5 4 3 2 1) */}
                          <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            {[5, 4, 3, 2, 1].map((score) => {
                              const isChecked = selectedScore === score;
                              const scoreLabels: Record<number, string> = {
                                5: 'มากที่สุด',
                                4: 'มาก',
                                3: 'ปานกลาง',
                                2: 'น้อย',
                                1: 'น้อยที่สุด',
                              };

                              return (
                                <button
                                  type="button"
                                  key={score}
                                  onClick={() => handleRatingChange(item.id, score)}
                                  className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] py-1.5 px-1 rounded-lg border transition-all text-xs font-semibold ${
                                    isChecked
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <span className="text-sm font-bold">{score}</span>
                                  <span className={`text-[10px] font-normal leading-tight mt-0.5 ${isChecked ? 'text-indigo-100' : 'text-slate-500'}`}>
                                    {scoreLabels[score]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Suggestions */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ส่วนที่ 3: ข้อเสนอแนะเพิ่มเติม</h2>
              <p className="text-xs text-slate-500">ข้อเสนอแนะหรือสิ่งที่ควรปรับปรุงสำหรับการจัดโครงการครั้งต่อไป (ถ้ามี)</p>
            </div>
          </div>

          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={4}
            placeholder="พิมพ์ข้อเสนอแนะ เช่น ด้านสถานที่ ด้านกิจกรรม ด้านอาหาร หรือความรู้สึกประทับใจ..."
            className="w-full p-3.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 text-sm leading-relaxed transition-all resize-none shadow-sm"
          ></textarea>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm font-medium shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ส่งแบบประเมินความพึงพอใจ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
