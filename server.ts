import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import { calculateSummary, generateSeedData } from './src/lib/analytics';
import { EvaluationSubmission } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'evaluations.json');
const GSHEETS_CONFIG_FILE = path.join(DATA_DIR, 'gsheets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory evaluation storage with file persistence
let evaluations: EvaluationSubmission[] = [];

function loadEvaluations(): EvaluationSubmission[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load evaluations from file:', e);
  }
  // Default to initial seed data if file doesn't exist
  const initial = generateSeedData();
  saveEvaluations(initial);
  return initial;
}

function saveEvaluations(data: EvaluationSubmission[]) {
  evaluations = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save evaluations to file:', e);
  }
}

// Load Google Sheets config
interface GSheetsConfig {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  lastSyncedAt?: string;
  autoSync?: boolean;
}

function loadGSheetsConfig(): GSheetsConfig {
  try {
    if (fs.existsSync(GSHEETS_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(GSHEETS_CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load gsheets config:', e);
  }
  return { autoSync: true };
}

function saveGSheetsConfig(config: GSheetsConfig) {
  try {
    fs.writeFileSync(GSHEETS_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save gsheets config:', e);
  }
}

// Google Sheets Sync Helper
async function performGSheetsSync(data: EvaluationSubmission[], existingSpreadsheetId?: string) {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  let spreadsheetId = existingSpreadsheetId;

  if (!spreadsheetId) {
    try {
      const createRes = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'ผลการประเมินโครงการเรียนรู้นอกห้องเรียน ม.2',
          },
          sheets: [
            {
              properties: {
                title: 'ผลประเมินความพึงพอใจ',
                gridProperties: { frozenRowCount: 1 },
              },
            },
          ],
        },
      });
      spreadsheetId = createRes.data.spreadsheetId || undefined;
    } catch (e) {
      console.warn('Failed to create new spreadsheet with custom sheet title, trying default:', e);
      const createRes = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'ผลการประเมินโครงการเรียนรู้นอกห้องเรียน ม.2',
          },
        },
      });
      spreadsheetId = createRes.data.spreadsheetId || undefined;
    }
  }

  if (!spreadsheetId) {
    throw new Error('ไม่สามารถสร้างหรือระบุ Spreadsheet ID ได้');
  }

  const headers = [
    'รหัสแบบประเมิน (ID)',
    'วัน-เวลาที่ส่ง',
    'เพศ',
    'สถานะ',
    'ระดับชั้น/ห้อง',
    'ข้อ 1 (ความรู้)',
    'ข้อ 2 (เชื่อมโยงบทเรียน)',
    'ข้อ 3 (ความเหมาะสมสถานที่)',
    'ข้อ 4 (การดูแลของวิทยากร)',
    'ข้อ 5 (การทำงานทีม)',
    'ข้อ 6 (ความคิดสร้างสรรค์)',
    'ข้อ 7 (ความเหมาะสมเวลา)',
    'ข้อ 8 (การประยุกต์ใช้)',
    'ข้อ 9 (ความพร้อมและปลอดภัย)',
    'ข้อ 10 (ความพึงพอใจภาพรวม)',
    'คะแนนเฉลี่ยรวม',
    'ข้อเสนอแนะเพิ่มเติม',
  ];

  const rows = data.map((sub) => {
    const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => sub.ratings[i] || 0);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0';
    return [
      sub.id,
      new Date(sub.createdAt).toLocaleString('th-TH'),
      sub.gender,
      sub.status,
      sub.classroom,
      ...scores,
      avg,
      sub.suggestions || '',
    ];
  });

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'ผลประเมินความพึงพอใจ!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows],
      },
    });
  } catch (rangeErr) {
    console.warn('Fallback updating sheet range A1:', rangeErr);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows],
      },
    });
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  const config: GSheetsConfig = {
    spreadsheetId,
    spreadsheetUrl: url,
    lastSyncedAt: new Date().toISOString(),
    autoSync: true,
  };
  saveGSheetsConfig(config);

  return {
    spreadsheetId,
    spreadsheetUrl: url,
    syncedCount: data.length,
    lastSyncedAt: config.lastSyncedAt,
  };
}

// Load initial data
evaluations = loadEvaluations();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes

  // 1. Get Evaluations & Summary
  app.get('/api/evaluations', (_req, res) => {
    const summary = calculateSummary(evaluations);
    const gsheetsConfig = loadGSheetsConfig();
    res.json({
      success: true,
      data: evaluations,
      summary,
      gsheets: gsheetsConfig,
    });
  });

  // 2. Submit new evaluation
  app.post('/api/evaluations', async (req, res) => {
    try {
      const { gender, status, classroom, ratings, suggestions } = req.body;

      if (!gender || !status || !ratings) {
        res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกแบบประเมินให้ครบ' });
        return;
      }

      const newSubmission: EvaluationSubmission = {
        id: `SUB-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        gender,
        status,
        classroom: classroom || (status === 'ครู' ? '- (ครูผู้สอน)' : 'ไม่ระบุ'),
        ratings,
        suggestions: suggestions?.trim() || undefined,
      };

      const updated = [newSubmission, ...evaluations];
      saveEvaluations(updated);

      // Trigger background sync to Google Sheets if configured
      const gsheetsConfig = loadGSheetsConfig();
      if (gsheetsConfig.spreadsheetId) {
        performGSheetsSync(updated, gsheetsConfig.spreadsheetId).catch((err) =>
          console.error('Background Google Sheets sync error:', err)
        );
      }

      res.json({
        success: true,
        message: 'บันทึกแบบประเมินความพึงพอใจเรียบร้อยแล้ว',
        submission: newSubmission,
      });
    } catch (err: any) {
      console.error('Error submitting evaluation:', err);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  });

  // 3. Re-seed mock data
  app.post('/api/evaluations/seed', (_req, res) => {
    const seeded = generateSeedData();
    saveEvaluations(seeded);
    const summary = calculateSummary(seeded);
    res.json({
      success: true,
      message: 'สร้างข้อมูลตัวอย่างสำหรับการทดสอบเรียบร้อยแล้ว',
      data: seeded,
      summary,
    });
  });

  // 4. Clear all evaluations
  app.delete('/api/evaluations', (_req, res) => {
    saveEvaluations([]);
    res.json({
      success: true,
      message: 'ล้างข้อมูลแบบประเมินทั้งหมดเรียบร้อยแล้ว',
      data: [],
      summary: calculateSummary([]),
    });
  });

  // 4.1 Delete single evaluation record by ID
  app.delete('/api/evaluations/:id', (req, res) => {
    const { id } = req.params;
    const updated = evaluations.filter((item) => item.id !== id);
    saveEvaluations(updated);
    res.json({
      success: true,
      message: `ลบข้อมูลรหัส ${id} เรียบร้อยแล้ว`,
      data: updated,
      summary: calculateSummary(updated),
    });
  });

  // 5. Get Google Sheets Status
  app.get('/api/gsheets/status', (_req, res) => {
    const config = loadGSheetsConfig();
    res.json({
      success: true,
      config,
      totalRecords: evaluations.length,
    });
  });

  // 6. Manual or Initial Google Sheets Sync / Export
  app.post('/api/gsheets/sync', async (req, res) => {
    try {
      const { spreadsheetId: requestedId } = req.body || {};
      const config = loadGSheetsConfig();
      const targetId = requestedId || config.spreadsheetId;

      const syncResult = await performGSheetsSync(evaluations, targetId);

      res.json({
        success: true,
        message: 'บันทึกและซิงค์ข้อมูลลง Google Sheets สำเร็จ!',
        ...syncResult,
      });
    } catch (err: any) {
      console.error('Google Sheets Sync Failed:', err);
      const errMsg = err.message || String(err);
      let userFriendlyMsg = `ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${errMsg}`;
      
      if (errMsg.includes('Google Sheets API has not been used') || errMsg.includes('disabled')) {
        userFriendlyMsg = 'กำลังเปิดใช้งาน Google Sheets API ในระบบ Google Cloud กรุณารอประมาณ 1-2 นาที แล้วคลิกปุ่มซิงค์ข้อมูลอีกครั้ง';
      }

      res.status(500).json({
        success: false,
        message: userFriendlyMsg,
      });
    }
  });

  // Vite Middleware for Dev or Static Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
