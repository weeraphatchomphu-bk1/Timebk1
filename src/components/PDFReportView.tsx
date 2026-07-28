import React from 'react';
import { EvaluationSummary, PROJECT_OBJECTIVES } from '../types';

interface PDFReportViewProps {
  summary: EvaluationSummary;
  evaluationsCount: number;
}

export const PDFReportView: React.FC<PDFReportViewProps> = ({ summary, evaluationsCount }) => {
  return (
    <div
      id="pdf-report-container"
      className="bg-white text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 font-sans leading-relaxed text-xs sm:text-sm space-y-6"
      style={{ minWidth: '794px' }}
    >
      {/* Header Banner */}
      <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
        <div className="font-bold text-lg text-slate-900">
          แบบสรุปผลการวิเคราะห์ประเมินความพึงพอใจโครงการ
        </div>
        <h1 className="font-extrabold text-xl text-indigo-950">
          โครงการเรียนรู้นอกห้องเรียน ชั้นมัธยมศึกษาปีที่ 2
        </h1>
      </div>

      {/* 1. Project Objectives */}
      <div className="space-y-2">
        <h2 className="font-bold text-sm text-slate-900 border-l-4 border-indigo-700 pl-2">
          1. วัตถุประสงค์ของโครงการ (3 ข้อ)
        </h2>
        <ul className="list-none pl-3 space-y-1 text-slate-700 text-xs">
          {PROJECT_OBJECTIVES.map((obj, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-bold text-indigo-800">•</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Sample Data Summary */}
      <div className="space-y-2">
        <h2 className="font-bold text-sm text-slate-900 border-l-4 border-indigo-700 pl-2">
          2. สรุปจำนวนผู้ตอบแบบประเมิน (Sample Demographic)
        </h2>
        <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center text-xs">
          <div>
            <span className="text-slate-500 block">ผู้ตอบทั้งหมด</span>
            <span className="font-bold text-indigo-900 text-base">{evaluationsCount} คน</span>
          </div>
          <div>
            <span className="text-slate-500 block">นักเรียน</span>
            <span className="font-bold text-slate-800 text-base">{summary.studentCount} คน</span>
          </div>
          <div>
            <span className="text-slate-500 block">ครูผู้สอน</span>
            <span className="font-bold text-slate-800 text-base">{summary.teacherCount} คน</span>
          </div>
          <div>
            <span className="text-slate-500 block">จำแนกเพศ</span>
            <span className="font-bold text-slate-800 text-xs">
              ชาย {summary.genderBreakdown.male} / หญิง {summary.genderBreakdown.female}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Academic Evaluation Analysis Table (10 items) */}
      <div className="space-y-2">
        <h2 className="font-bold text-sm text-slate-900 border-l-4 border-indigo-700 pl-2">
          3. ตารางวิเคราะห์ค่าเฉลี่ย (Mean) และค่าเบี่ยงเบนมาตรฐาน (S.D.) รายหมวดและรายข้อ (10 ข้อ)
        </h2>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
              <th className="p-2 border border-slate-300 w-12">ที่</th>
              <th className="p-2 border border-slate-300 text-left">รายการประเมินความพึงพอใจ</th>
              <th className="p-2 border border-slate-300 w-16">ค่าเฉลี่ย (Mean)</th>
              <th className="p-2 border border-slate-300 w-16">S.D.</th>
              <th className="p-2 border border-slate-300 w-28">ระดับความพึงพอใจ</th>
            </tr>
          </thead>
          <tbody>
            {summary.categorySummaries.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <tr className="bg-indigo-50/80 font-bold text-indigo-950 border-b border-slate-300">
                  <td colSpan={2} className="p-2 border border-slate-300">
                    {category.title}
                  </td>
                  <td className="p-2 border border-slate-300 text-center">{category.mean.toFixed(2)}</td>
                  <td className="p-2 border border-slate-300 text-center">{category.sd.toFixed(2)}</td>
                  <td className="p-2 border border-slate-300 text-center font-semibold">{category.level}</td>
                </tr>

                {/* Individual Question Rows */}
                {category.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center font-medium">{item.id}</td>
                    <td className="p-2 border border-slate-300">{item.question}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-slate-800">
                      {item.mean.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-300 text-center text-slate-600">
                      {item.sd.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">{item.level}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Total Summary Row */}
            <tr className="bg-indigo-900 text-white font-extrabold text-sm">
              <td colSpan={2} className="p-2.5 border border-indigo-950 text-right pr-4">
                เฉลี่ยรวมทุกหมวด (Overall Mean)
              </td>
              <td className="p-2.5 border border-indigo-950 text-center text-amber-300 text-base">
                {summary.overallMean.toFixed(2)}
              </td>
              <td className="p-2.5 border border-indigo-950 text-center">{summary.overallSD.toFixed(2)}</td>
              <td className="p-2.5 border border-indigo-950 text-center text-amber-300">
                {summary.overallLevel}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-[10px] text-slate-500 italic">
          * เกณฑ์การแปลผล: 4.50–5.00 = มากที่สุด, 3.50–4.49 = มาก, 2.50–3.49 = ปานกลาง, 1.50–2.49 = น้อย, 1.00–1.49 = น้อยที่สุด
        </p>
      </div>

      {/* 4. Qualitative Conclusion Aligned with Project Objectives */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <h3 className="font-bold text-indigo-950 border-b border-slate-200 pb-2">
          4. สรุปผลการประเมินและการบรรลุวัตถุประสงค์ของโครงการ
        </h3>
        <p className="text-slate-700 leading-relaxed">
          การวิเคราะห์ผลการประเมินความพึงพอใจต่อโครงการเรียนรู้นอกห้องเรียน ชั้นมัธยมศึกษาปีที่ 2 ในภาพรวมมีค่าเฉลี่ยเท่ากับ{' '}
          <strong className="text-indigo-900 font-extrabold">{summary.overallMean.toFixed(2)}</strong> (S.D. = {summary.overallSD.toFixed(2)}) 
          อยู่ในระดับ <strong className="text-indigo-900 font-extrabold">{summary.overallLevel}</strong> ซึ่งสามารถสรุปผลการบรรลุตามวัตถุประสงค์ของโครงการทั้ง 3 ข้อ ได้ดังนี้:
        </p>
        <div className="space-y-2 pl-2 text-slate-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-800 shrink-0">วัตถุประสงค์ข้อที่ 1:</span>
            <span>
              <strong>เพื่อศึกษาเรียนรู้เพิ่มเติมจากการเรียนรู้ภายในห้องเรียน</strong> — บรรลุตามวัตถุประสงค์ โดยหมวดเนื้อหาและการจัดกิจกรรมการเรียนรู้มีค่าเฉลี่ย{' '}
              {summary.categorySummaries[0]?.mean.toFixed(2) || summary.overallMean.toFixed(2)} อยู่ในระดับ {summary.categorySummaries[0]?.level || summary.overallLevel} ผู้เรียนได้รับความรู้และประสบการณ์ตรงนอกเหนือจากบทเรียนในห้องเรียน
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-800 shrink-0">วัตถุประสงค์ข้อที่ 2:</span>
            <span>
              <strong>เพื่อเรียนรู้จากสภาพจริง สถานการณ์จริง ในพื้นที่และท้องถิ่น</strong> — บรรลุตามวัตถุประสงค์ โดยหมวดสถานที่ วิทยากร และความพร้อม มีค่าเฉลี่ย{' '}
              {summary.categorySummaries[1]?.mean.toFixed(2) || summary.overallMean.toFixed(2)} อยู่ในระดับ {summary.categorySummaries[1]?.level || summary.overallLevel} ผู้เรียนได้สัมผัสสถานที่และสถานการณ์จริงในภูมิศาสตร์และบริบทท้องถิ่นที่แตกต่าง
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-800 shrink-0">วัตถุประสงค์ข้อที่ 3:</span>
            <span>
              <strong>เพื่อเรียนรู้ร่วมกันระหว่างผู้สอน ผู้เรียน บุคลากร และท้องถิ่น</strong> — บรรลุตามวัตถุประสงค์ โดยหมวดประโยชน์ การทำงานร่วมกัน และความพึงพอใจภาพรวม มีค่าเฉลี่ย{' '}
              {summary.categorySummaries[2]?.mean.toFixed(2) || summary.overallMean.toFixed(2)} อยู่ในระดับ {summary.categorySummaries[2]?.level || summary.overallLevel} เกิดกระบวนการเรียนรู้ร่วมกันและการบูรณาการองค์ความรู้อย่างมีประสิทธิภาพ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
