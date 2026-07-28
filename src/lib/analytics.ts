import {
  EVALUATION_CATEGORIES,
  EvaluationSubmission,
  EvaluationSummary,
  CategorySummary,
  ItemSummary,
  getSatisfactionLevel,
} from '../types';

export function calculateSummary(evaluations: EvaluationSubmission[]): EvaluationSummary {
  const totalCount = evaluations.length;

  if (totalCount === 0) {
    return {
      totalCount: 0,
      studentCount: 0,
      teacherCount: 0,
      genderBreakdown: { male: 0, female: 0, unspecified: 0 },
      classroomBreakdown: {},
      classroomMean: {},
      overallMean: 0,
      overallSD: 0,
      overallLevel: 'ไม่มีข้อมูล',
      categorySummaries: EVALUATION_CATEGORIES.map((cat) => ({
        id: cat.id,
        title: cat.title,
        mean: 0,
        sd: 0,
        level: 'ไม่มีข้อมูล',
        items: cat.items.map((item) => ({
          id: item.id,
          question: item.question,
          categoryId: item.categoryId,
          mean: 0,
          sd: 0,
          level: 'ไม่มีข้อมูล',
          levelBadgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
          scoreCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        })),
      })),
    };
  }

  // Count breakdowns
  let studentCount = 0;
  let teacherCount = 0;
  const genderBreakdown = { male: 0, female: 0, unspecified: 0 };
  const classroomBreakdown: Record<string, number> = {};
  const classroomScores: Record<string, number[]> = {};

  evaluations.forEach((sub) => {
    if (sub.status === 'นักเรียน') studentCount++;
    else if (sub.status === 'ครู') teacherCount++;

    if (sub.gender === 'ชาย') genderBreakdown.male++;
    else if (sub.gender === 'หญิง') genderBreakdown.female++;
    else genderBreakdown.unspecified++;

    const room = sub.classroom || 'ไม่ระบุ';
    classroomBreakdown[room] = (classroomBreakdown[room] || 0) + 1;

    // calculate user overall score
    const scores = Object.values(sub.ratings);
    const userAvg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    if (!classroomScores[room]) classroomScores[room] = [];
    classroomScores[room].push(userAvg);
  });

  const classroomMean: Record<string, { count: number; mean: number }> = {};
  Object.keys(classroomBreakdown).forEach((room) => {
    const list = classroomScores[room] || [];
    const mean = list.length > 0 ? list.reduce((a, b) => a + b, 0) / list.length : 0;
    classroomMean[room] = {
      count: classroomBreakdown[room],
      mean: Number(mean.toFixed(2)),
    };
  });

  // Calculate Overall scores (all items averaged per user or across all ratings)
  const allUserAverages = evaluations.map((e) => {
    const vals = Object.values(e.ratings);
    return vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  });

  const overallMean = allUserAverages.reduce((a, b) => a + b, 0) / totalCount;
  const variance =
    totalCount > 1
      ? allUserAverages.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / (totalCount - 1)
      : 0;
  const overallSD = Math.sqrt(variance);

  // Category & Item level analysis
  const categorySummaries: CategorySummary[] = EVALUATION_CATEGORIES.map((cat) => {
    const itemSummaries: ItemSummary[] = cat.items.map((item) => {
      const itemScores = evaluations.map((e) => e.ratings[item.id] || 0);
      const scoreCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      itemScores.forEach((s) => {
        if (s >= 1 && s <= 5) {
          scoreCounts[s as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      const mean = itemScores.reduce((a, b) => a + b, 0) / totalCount;
      const itemVar =
        totalCount > 1
          ? itemScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (totalCount - 1)
          : 0;
      const sd = Math.sqrt(itemVar);
      const levelObj = getSatisfactionLevel(mean);

      return {
        id: item.id,
        question: item.question,
        categoryId: item.categoryId,
        mean: Number(mean.toFixed(2)),
        sd: Number(sd.toFixed(2)),
        level: levelObj.level,
        levelBadgeColor: levelObj.badgeBg,
        scoreCounts,
      };
    });

    const catItemMeans = itemSummaries.map((i) => i.mean);
    const catMean = catItemMeans.reduce((a, b) => a + b, 0) / catItemMeans.length;

    // Calculate SD across all items in this category for each submission
    const catUserScores = evaluations.map((e) => {
      const catItemVals = cat.items.map((it) => e.ratings[it.id] || 0);
      return catItemVals.reduce((a, b) => a + b, 0) / catItemVals.length;
    });

    const catVariance =
      totalCount > 1
        ? catUserScores.reduce((sum, val) => sum + Math.pow(val - catMean, 2), 0) / (totalCount - 1)
        : 0;
    const catSD = Math.sqrt(catVariance);

    return {
      id: cat.id,
      title: cat.title,
      mean: Number(catMean.toFixed(2)),
      sd: Number(catSD.toFixed(2)),
      level: getSatisfactionLevel(catMean).level,
      items: itemSummaries,
    };
  });

  return {
    totalCount,
    studentCount,
    teacherCount,
    genderBreakdown,
    classroomBreakdown,
    classroomMean,
    overallMean: Number(overallMean.toFixed(2)),
    overallSD: Number(overallSD.toFixed(2)),
    overallLevel: getSatisfactionLevel(overallMean).level,
    categorySummaries,
  };
}

export function generateSeedData(): EvaluationSubmission[] {
  const sampleData: EvaluationSubmission[] = [];
  const classrooms = ['ม.2/1', 'ม.2/2'];
  const genders: ('ชาย' | 'หญิง')[] = ['ชาย', 'หญิง'];

  const suggestionsList = [
    'อยากให้มีเวลาทำกิจกรรมเพิ่มขึ้นอีกนิดครับ สนุกมาก',
    'อาหารอร่อยและสถานที่ศึกษาดูงานตรงกับเนื้อหาที่เรียนมากค่ะ',
    'วิทยากรให้ความรู้เป็นกันเอง และเตรียมอุปกรณ์ได้พร้อมมาก',
    'อยากให้จัดกิจกรรมลักษณะนี้นอกสถานที่ทุกภาคเรียนครับ',
    'รถบัสเดินทางปลอดภัย ตรงต่อเวลา ครูดูแลนักเรียนอย่างใกล้ชิด',
    'ได้เรียนรู้จากประสบการณ์จริงดีกว่าอ่านหนังสืออย่างเดียวค่ะ',
    'การจัดกลุ่มกิจกรรมร่วมกับเพื่อนช่วยสร้างความสามัคคีดีมาก',
  ];

  let idCount = 1;

  // Generate 25 student responses
  classrooms.forEach((room) => {
    const studentNum = 4 + Math.floor(Math.random() * 2); // 4-5 students per room
    for (let i = 0; i < studentNum; i++) {
      const gender = genders[i % 2];
      // Generate realistic scores mostly 4s and 5s
      const ratings: Record<number, number> = {};
      for (let item = 1; item <= 10; item++) {
        // High satisfaction trend: ~60% 5s, ~30% 4s, ~10% 3s
        const rand = Math.random();
        if (rand > 0.35) ratings[item] = 5;
        else if (rand > 0.08) ratings[item] = 4;
        else ratings[item] = 3;
      }

      const createdDate = new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3));

      sampleData.push({
        id: `SUB-${1000 + idCount}`,
        createdAt: createdDate.toISOString(),
        gender,
        status: 'นักเรียน',
        classroom: room,
        ratings,
        suggestions: Math.random() > 0.6 ? suggestionsList[idCount % suggestionsList.length] : undefined,
      });
      idCount++;
    }
  });

  // Generate 5 teacher responses
  for (let i = 0; i < 5; i++) {
    const gender = genders[i % 2];
    const ratings: Record<number, number> = {};
    for (let item = 1; item <= 10; item++) {
      ratings[item] = Math.random() > 0.2 ? 5 : 4;
    }
    const createdDate = new Date(Date.now() - Math.floor(Math.random() * 86400000 * 2));

    sampleData.push({
      id: `SUB-${1000 + idCount}`,
      createdAt: createdDate.toISOString(),
      gender,
      status: 'ครู',
      classroom: '- (ครูผู้สอน)',
      ratings,
      suggestions: i === 0 ? 'โครงการบรรลุตามวัตถุประสงค์ทุกประการ ควรจัดอย่างต่อเนื่องในปีการศึกษาถัดไป' : undefined,
    });
    idCount++;
  }

  return sampleData;
}
