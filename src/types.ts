export type EvaluatorStatus = 'นักเรียน' | 'ครู';
export type Gender = 'ชาย' | 'หญิง' | 'ไม่ระบุ';

export const CLASSROOM_OPTIONS = [
  'ม.2/1',
  'ม.2/2',
] as const;

export type ClassRoomOption = typeof CLASSROOM_OPTIONS[number] | '- (ครูผู้สอน)';

export interface EvaluationItem {
  id: number;
  question: string;
  categoryId: number;
  categoryTitle: string;
}

export interface EvaluationCategory {
  id: number;
  title: string;
  items: EvaluationItem[];
}

export const PROJECT_OBJECTIVES = [
  '1. เพื่อศึกษาเรียนรู้เพิ่มเติมจากการเรียนรู้ภายในห้องเรียน',
  '2. เพื่อเรียนรู้จากสภาพจริง สถานการณ์จริง ในพื้นที่ และท้องถิ่นที่แตกต่างไปจากเดิมอย่างกว้างขวาง',
  '3. เพื่อเรียนรู้ร่วมกันระหว่างผู้สอน ผู้เรียน บุคลากรสนับสนุนการสอน ท้องถิ่น ในการบูรณาการองค์ความรู้นอกเหนือจากห้องเรียน ในภูมิศาสตร์ และประวัติศาสตร์ที่แตกต่างจากการจัดการเรียนรู้ปกติ',
];

export const EVALUATION_CATEGORIES: EvaluationCategory[] = [
  {
    id: 1,
    title: 'หมวดที่ 1: ด้านความรู้และการเรียนรู้จากสภาพจริง',
    items: [
      {
        id: 1,
        question: '1. กิจกรรมช่วยเพิ่มพูนความรู้และประสบการณ์จากการเรียนรู้นอกห้องเรียน',
        categoryId: 1,
        categoryTitle: 'ด้านความรู้และการเรียนรู้จากสภาพจริง',
      },
      {
        id: 2,
        question: '2. สามารถเชื่อมโยงเนื้อหาวิชาในบทเรียนกับสถานที่ศึกษาดูงานจริง',
        categoryId: 1,
        categoryTitle: 'ด้านความรู้และการเรียนรู้จากสภาพจริง',
      },
      {
        id: 3,
        question: '3. สถานที่และแหล่งเรียนรู้นอกห้องเรียนมีความเหมาะสมและน่าสนใจ',
        categoryId: 1,
        categoryTitle: 'ด้านความรู้และการเรียนรู้จากสภาพจริง',
      },
      {
        id: 4,
        question: '4. ได้รับการดูแล แนะนำ และถ่ายทอดความรู้จากวิทยากร/ครูผู้ดูแลอย่างทั่วถึง',
        categoryId: 1,
        categoryTitle: 'ด้านความรู้และการเรียนรู้จากสภาพจริง',
      },
    ],
  },
  {
    id: 2,
    title: 'หมวดที่ 2: ด้านการมีส่วนร่วมและการบูรณาการองค์ความรู้',
    items: [
      {
        id: 5,
        question: '5. มีโอกาสร่วมทำกิจกรรม ทำงานเป็นทีม และแลกเปลี่ยนความคิดเห็นกับเพื่อน',
        categoryId: 2,
        categoryTitle: 'ด้านการมีส่วนร่วมและการบูรณาการองค์ความรู้',
      },
      {
        id: 6,
        question: '6. กิจกรรมส่งเสริมให้เกิดความคิดสร้างสรรค์และการแก้ปัญหาเฉพาะหน้า',
        categoryId: 2,
        categoryTitle: 'ด้านการมีส่วนร่วมและการบูรณาการองค์ความรู้',
      },
      {
        id: 7,
        question: '7. ระยะเวลาและขั้นตอนในการดำเนินกิจกรรมมีความเหมาะสม',
        categoryId: 2,
        categoryTitle: 'ด้านการมีส่วนร่วมและการบูรณาการองค์ความรู้',
      },
    ],
  },
  {
    id: 3,
    title: 'หมวดที่ 3: ด้านการนำไปใช้ประโยชน์และความพึงพอใจภาพรวม',
    items: [
      {
        id: 8,
        question: '8. สามารถนำความรู้และประสบการณ์ที่ได้รับไปประยุกต์ใช้ในการเรียนและการดำเนินชีวิต',
        categoryId: 3,
        categoryTitle: 'ด้านการนำไปใช้ประโยชน์และความพึงพอใจภาพรวม',
      },
      {
        id: 9,
        question: '9. ความพร้อมของวัสดุ อุปกรณ์ อาหาร ยานพาหนะ และความปลอดภัยในการเดินทาง',
        categoryId: 3,
        categoryTitle: 'ด้านการนำไปใช้ประโยชน์และความพึงพอใจภาพรวม',
      },
      {
        id: 10,
        question: '10. มีความพึงพอใจในภาพรวมต่อการเข้าร่วมโครงการเรียนรู้นอกห้องเรียน ม.2',
        categoryId: 3,
        categoryTitle: 'ด้านการนำไปใช้ประโยชน์และความพึงพอใจภาพรวม',
      },
    ],
  },
];

export interface EvaluationSubmission {
  id: string;
  createdAt: string;
  gender: Gender;
  status: EvaluatorStatus;
  classroom: string;
  ratings: Record<number, number>; // item id (1-10) -> score (1-5)
  suggestions?: string;
}

export interface ItemSummary {
  id: number;
  question: string;
  categoryId: number;
  mean: number;
  sd: number;
  level: string;
  levelBadgeColor: string;
  scoreCounts: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export interface CategorySummary {
  id: number;
  title: string;
  mean: number;
  sd: number;
  level: string;
  items: ItemSummary[];
}

export interface EvaluationSummary {
  totalCount: number;
  studentCount: number;
  teacherCount: number;
  genderBreakdown: {
    male: number;
    female: number;
    unspecified: number;
  };
  classroomBreakdown: Record<string, number>;
  classroomMean: Record<string, { count: number; mean: number }>;
  overallMean: number;
  overallSD: number;
  overallLevel: string;
  categorySummaries: CategorySummary[];
}

export function getSatisfactionLevel(mean: number): { level: string; color: string; badgeBg: string } {
  if (mean >= 4.5) {
    return { level: 'มากที่สุด', color: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  if (mean >= 3.5) {
    return { level: 'มาก', color: 'text-blue-700', badgeBg: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  if (mean >= 2.5) {
    return { level: 'ปานกลาง', color: 'text-amber-700', badgeBg: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (mean >= 1.5) {
    return { level: 'น้อย', color: 'text-orange-700', badgeBg: 'bg-orange-100 text-orange-800 border-orange-200' };
  }
  return { level: 'น้อยที่สุด', color: 'text-rose-700', badgeBg: 'bg-rose-100 text-rose-800 border-rose-200' };
}
