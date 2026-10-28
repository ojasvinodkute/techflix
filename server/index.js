import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUESTIONS, ROUNDS } from './questions.js';
import { initStore, db, persist, wipe } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ANSWER_MS = 30000; // per-question answer timer
const GRACE_MS = 1500; // network latency allowance
const FEEDBACK_MS = 1500; // pause between questions (client shows right/wrong)
const POINTS = 10;
const ROUND_IDS = [1, 2, 3];

// ---------- secrets (never sent to the browser) ----------
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
let ADMIN_PASS = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASS) {
  ADMIN_PASS = crypto.randomBytes(5).toString('hex');
  console.warn(`\n[!] ADMIN_PASSWORD env var not set. Temporary organizer login -> ${ADMIN_USER} / ${ADMIN_PASS}\n    (changes on every restart; set ADMIN_PASSWORD in Render > Environment)\n`);
}
const SECRET = process.env.TOKEN_SECRET || crypto.createHash('sha256').update('techflix:' + ADMIN_PASS).digest('hex');

const b64 = (s) => Buffer.from(s).toString('base64url');
const mac = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');
const sign = (payload, ttlMs = 12 * 3600e3) => {
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + ttlMs }));
  return `${body}.${mac(body)}`;
};
const same = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
function verify(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig || !same(sig, mac(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
const hashCode = (code) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(code, salt, 32).toString('hex')}`;
};
const checkCode = (code, stored) => {
  const [salt, h] = String(stored).split(':');
  const x = crypto.scryptSync(String(code), salt, 32);
  return crypto.timingSafeEqual(x, Buffer.from(h, 'hex'));
};

// light brute-force guard (per email / per ip, NOT per ip alone: campus wifi shares one IP)
const fails = new Map();
const locked = (k) => (fails.get(k) || []).filter((t) => Date.now() - t < 600e3).length >= 8;
const fail = (k) => fails.set(k, [...(fails.get(k) || []).filter((t) => Date.now() - t < 600e3), Date.now()]);

// ---------- app ----------
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' });
  if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');
  next();
});
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const auth = (role) => (req, res, next) => {
  const p = verify((req.headers.authorization || '').replace(/^Bearer /, ''));
  if (!p || p.role !== role) return bad(res, 'Not authorized. Please log in again.', 401);
  req.auth = p;
  next();
};

// ---------- game state ----------
const newState = () => ({
  activeRound: null,
  leaderboardVisible: false,
  rounds: Object.fromEntries(ROUND_IDS.map((n) => [n, { status: 'locked', pausedAt: null }])),
});
const S = () => db.rounds.state;
const qDef = (round, id) => QUESTIONS[round].find((q) => q.id === id);
const key = (teamId, round) => `${teamId}_${round}`;

function seeded(seedStr) {
  let h = crypto.createHash('sha256').update(seedStr).digest().readUInt32LE(0);
  return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const shuffle = (arr, rnd) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const timing = (att, q) => {
  const memEnd = att.qStartedAt + (q.memorize ? q.memorize.seconds * 1000 : 0);
  return { memEnd, deadline: memEnd + ANSWER_MS };
};
const curQ = (att) => qDef(att.round, att.order[att.index]);

// store one answer (orig = index in the ORIGINAL options, or null for timeout) and advance
function record(att, q, orig, now) {
  const t = timing(att, q);
  const correct = orig !== null && orig === q.answer;
  att.answers.push({ qid: q.id, choice: orig, correct, ms: orig === null ? ANSWER_MS : Math.min(ANSWER_MS, Math.max(0, now - t.memEnd)), at: now });
  if (correct) att.score += POINTS;
  att.index += 1;
  if (att.index >= att.order.length) { att.status = 'done'; att.finishedAt = now; }
  else att.qStartedAt = now + FEEDBACK_MS;
  return correct;
}

// apply timeouts that happened while the client was away
function sync(att, now) {
  if (att.status !== 'inprogress' || S().rounds[att.round].status !== 'live') return false;
  let changed = false;
  while (att.status === 'inprogress') {
    const q = curQ(att);
    if (now > timing(att, q).deadline + GRACE_MS) { record(att, q, null, now); changed = true; } else break;
  }
  if (changed) persist('scores', key(att.teamId, att.round));
  return changed;
}

function ranked() {
  const rows = Object.values(db.teams).map((t) => {
    const rounds = {};
    let total = 0, timeMs = 0;
    for (const n of ROUND_IDS) {
      const a = db.scores[key(t.id, n)];
      rounds[n] = a ? { status: a.status, score: a.score, answered: a.answers.length, total: a.order.length } : null;
      if (a) { total += a.score; timeMs += a.answers.reduce((s, x) => s + x.ms, 0); }
    }
    return { id: t.id, name: t.name, leader: t.leader, email: t.email, members: t.members, createdAt: t.createdAt, rounds, total, timeMs };
  });
  rows.sort((a, b) => b.total - a.total || a.timeMs - b.timeMs || a.createdAt - b.createdAt);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

const publicState = () => ({
  serverNow: Date.now(),
  activeRound: S().activeRound,
  leaderboardVisible: S().leaderboardVisible,
  rounds: ROUND_IDS.map((n) => ({ n, name: ROUNDS[n].name, tagline: ROUNDS[n].tagline, count: ROUNDS[n].count, status: S().rounds[n].status })),
});

// ---------- public ----------
app.get('/healthz', (_req, res) => res.send('ok'));
app.get('/api/state', (_req, res) => res.json(publicState()));

const clean = (s) => String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim();
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const rand = (n) => Array.from(crypto.randomBytes(n), (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');

app.post('/api/register', (req, res) => {
  const b = req.body || {};
  const name = clean(b.teamName), leader = clean(b.leaderName);
  const email = String(b.email || '').trim().toLowerCase();
  const members = (Array.isArray(b.members) ? b.members : []).slice(0, 5).map(clean).filter(Boolean);
  if (name.length < 2 || name.length > 40) return bad(res, 'Team name must be 2–40 characters.');
  if (leader.length < 2 || leader.length > 60) return bad(res, 'Leader name must be 2–60 characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return bad(res, 'Enter a valid email address.');
  if (members.some((m) => m.length > 60)) return bad(res, 'Member names must be under 60 characters.');
  const teams = Object.values(db.teams);
  if (teams.length >= 1000) return bad(res, 'Registration is full.', 409);
  if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) return bad(res, 'That team name is already taken. Pick another.', 409);
  if (teams.some((t) => t.email === email)) return bad(res, 'This email is already registered to a team.', 409);
  let id;
  do { id = 'TFX-' + rand(4); } while (db.teams[id]);
  const accessCode = rand(6);
  db.teams[id] = { id, name, leader, email, members, createdAt: Date.now(), codeHash: hashCode(accessCode) };
  persist('teams', id);
  res.status(201).json({ teamId: id, teamName: name, accessCode });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.accessCode || '').trim().toUpperCase();
  const k = 'team:' + email;
  if (locked(k)) return bad(res, 'Too many wrong attempts. Wait 10 minutes.', 429);
  const t = Object.values(db.teams).find((x) => x.email === email);
  if (!t || !code || !checkCode(code, t.codeHash)) { fail(k); return bad(res, 'Wrong email or access code.', 401); }
  res.json({ token: sign({ role: 'team', id: t.id }), team: { id: t.id, name: t.name } });
});

app.get('/api/leaderboard', (_req, res) => {
  if (!S().leaderboardVisible) return res.json({ visible: false });
  res.json({ visible: true, rows: ranked().map((r) => ({ rank: r.rank, name: r.name, total: r.total, timeMs: r.timeMs })) });
});

// ---------- team ----------
app.get('/api/me', auth('team'), (req, res) => {
  const t = db.teams[req.auth.id];
  if (!t) return bad(res, 'Team not found. Please log in again.', 401);
  const now = Date.now();
  const me = ranked().find((r) => r.id === t.id);
  for (const n of ROUND_IDS) { const a = db.scores[key(t.id, n)]; if (a) sync(a, now); }
  res.json({
    team: { id: t.id, name: t.name, leader: t.leader, email: t.email, members: t.members },
    total: me.total, rounds: me.rounds, state: publicState(),
  });
});

app.post('/api/play/start', auth('team'), (req, res) => {
  const round = Number(req.body?.round);
  if (!ROUND_IDS.includes(round)) return bad(res, 'Unknown round.');
  const s = S();
  const k = key(req.auth.id, round);
  if (db.scores[k]) return res.json({ ok: true, existing: true }); // never reset an attempt
  if (s.activeRound !== round || s.rounds[round].status !== 'live') return bad(res, 'This round is not live right now.', 409);
  const rnd = seeded(k + ':' + SECRET);
  const order = shuffle(QUESTIONS[round].map((q) => q.id), rnd);
  const perms = Object.fromEntries(order.map((id) => [id, shuffle([0, 1, 2, 3], rnd)]));
  const now = Date.now();
  db.scores[k] = { teamId: req.auth.id, round, status: 'inprogress', order, perms, index: 0, score: 0, answers: [], startedAt: now, qStartedAt: now + FEEDBACK_MS };
  persist('scores', k);
  res.json({ ok: true });
});

app.get('/api/play/current', auth('team'), (req, res) => {
  const round = Number(req.query.round);
  if (!ROUND_IDS.includes(round)) return bad(res, 'Unknown round.');
  const now = Date.now();
  const rs = S().rounds[round];
  const att = db.scores[key(req.auth.id, round)];
  const out = { serverNow: now, round, name: ROUNDS[round].name, roundStatus: rs.status, active: S().activeRound === round, attempt: att ? att.status : 'none' };
  if (!att) return res.json(out);
  sync(att, now);
  Object.assign(out, { attempt: att.status, score: att.score, answered: att.answers.length, total: att.order.length, index: att.index });
  if (att.status === 'inprogress' && rs.status === 'live') {
    const q = curQ(att);
    const t = timing(att, q);
    if (now < att.qStartedAt) { out.phase = 'ready'; out.phaseEndsAt = att.qStartedAt; out.phaseMs = FEEDBACK_MS; }
    else if (q.memorize && now < t.memEnd) { // correct answers & question text stay hidden during this phase
      Object.assign(out, { phase: 'memorize', phaseEndsAt: t.memEnd, phaseMs: q.memorize.seconds * 1000, memorize: { title: q.memorize.title, lines: q.memorize.lines } });
    } else {
      const perm = att.perms[q.id];
      Object.assign(out, { phase: 'answer', phaseEndsAt: t.deadline, phaseMs: ANSWER_MS, question: { id: q.id, text: q.text, code: q.code || null, options: perm.map((i) => q.options[i]) } });
    }
  }
  res.json(out);
});

app.post('/api/play/answer', auth('team'), (req, res) => {
  const { round: r, qid, choice } = req.body || {};
  const round = Number(r);
  if (!ROUND_IDS.includes(round)) return bad(res, 'Unknown round.');
  const att = db.scores[key(req.auth.id, round)];
  if (!att) return bad(res, 'You have not started this round.', 404);
  if (S().rounds[round].status !== 'live') return bad(res, 'Round is not live (paused or ended).', 409);
  const now = Date.now();
  sync(att, now);
  if (att.status !== 'inprogress') return bad(res, 'Round already finished.', 409);
  const q = curQ(att);
  if (q.id !== qid) return bad(res, 'That question was already answered or timed out.', 409);
  const t = timing(att, q);
  if (now < t.memEnd || now < att.qStartedAt) return bad(res, 'Question is not open yet.', 400);
  const perm = att.perms[q.id];
  let orig = null;
  if (choice === null || choice === undefined) {
    if (now < t.deadline - 800) return bad(res, 'Too early to time out.', 400);
  } else {
    if (!Number.isInteger(choice) || choice < 0 || choice > 3) return bad(res, 'Invalid option.');
    orig = perm[choice];
  }
  const correct = record(att, q, orig, now);
  persist('scores', key(att.teamId, round));
  res.json({ correct, timedOut: orig === null, correctIndex: perm.indexOf(q.answer), score: att.score, done: att.status === 'done' });
});

// ---------- organizer ----------
app.post('/api/admin/login', (req, res) => {
  const k = 'admin:' + req.ip;
  if (locked(k)) return bad(res, 'Too many wrong attempts. Wait 10 minutes.', 429);
  const { username, password } = req.body || {};
  const ok = same(username ?? '', ADMIN_USER) & same(password ?? '', ADMIN_PASS);
  if (!ok) { fail(k); return bad(res, 'Wrong organizer credentials.', 401); }
  res.json({ token: sign({ role: 'admin' }) });
});

app.get('/api/admin/overview', auth('admin'), (_req, res) => {
  const now = Date.now();
  for (const a of Object.values(db.scores)) sync(a, now);
  const teams = ranked();
  const inProgress = Object.fromEntries(ROUND_IDS.map((n) => [n, Object.values(db.scores).filter((a) => a.round === n && a.status === 'inprogress').length]));
  res.json({ state: publicState(), teams, inProgress });
});

app.post('/api/admin/round', auth('admin'), (req, res) => {
  const { action } = req.body || {};
  const n = Number(req.body?.round);
  if (!ROUND_IDS.includes(n)) return bad(res, 'Unknown round.');
  const s = S(), r = s.rounds[n], now = Date.now();
  const cur = s.activeRound ? s.rounds[s.activeRound] : null;
  const attempts = Object.values(db.scores).filter((a) => a.round === n && a.status === 'inprogress');
  switch (action) {
    case 'select':
      if (cur && ['live', 'paused'].includes(cur.status) && s.activeRound !== n) return bad(res, `End Round ${s.activeRound} before selecting another round.`, 409);
      s.activeRound = n; break;
    case 'start':
      if (s.activeRound !== n) return bad(res, 'Select this round first.', 409);
      if (!['locked', 'ended'].includes(r.status)) return bad(res, 'Round is already running.', 409);
      r.status = 'live'; r.pausedAt = null; break;
    case 'pause':
      if (r.status !== 'live') return bad(res, 'Round is not live.', 409);
      r.status = 'paused'; r.pausedAt = now; break;
    case 'resume': {
      if (r.status !== 'paused') return bad(res, 'Round is not paused.', 409);
      const shift = now - r.pausedAt; // freeze everyone's timers for the paused duration
      for (const a of attempts) { a.qStartedAt += shift; persist('scores', key(a.teamId, n)); }
      r.status = 'live'; r.pausedAt = null; break;
    }
    case 'end':
      if (!['live', 'paused'].includes(r.status)) return bad(res, 'Round is not running.', 409);
      for (const a of attempts) { a.status = 'done'; a.finishedAt = now; persist('scores', key(a.teamId, n)); }
      r.status = 'ended'; r.pausedAt = null; break;
    default: return bad(res, 'Unknown action.');
  }
  persist('rounds', 'state');
  res.json({ ok: true, state: publicState() });
});

app.post('/api/admin/leaderboard', auth('admin'), (req, res) => {
  S().leaderboardVisible = !!req.body?.visible;
  persist('rounds', 'state');
  res.json({ ok: true, state: publicState() });
});

app.get('/api/admin/export.csv', auth('admin'), (_req, res) => {
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const head = ['Rank', 'Team ID', 'Team', 'Leader', 'Email', 'Members', 'Round 1', 'Round 2', 'Round 3', 'Total', 'Time (s)'];
  const lines = [head.map(cell).join(',')];
  for (const t of ranked()) {
    lines.push([t.rank, t.id, t.name, t.leader, t.email, t.members.join('; '), ...ROUND_IDS.map((n) => t.rounds[n]?.score ?? 0), t.total, (t.timeMs / 1000).toFixed(1)].map(cell).join(','));
  }
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="techflix-results.csv"' });
  res.send('\ufeff' + lines.join('\r\n'));
});

app.post('/api/admin/reset', auth('admin'), async (req, res) => {
  if (req.body?.confirm !== 'RESET') return bad(res, 'Type RESET to confirm.');
  await wipe('teams'); await wipe('scores');
  db.rounds.state = newState();
  persist('rounds', 'state');
  res.json({ ok: true });
});

// ---------- frontend ----------
const dist = path.resolve(__dirname, '../dist');
app.use('/api', (_req, res) => bad(res, 'Not found.', 404));
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('/', (_req, res) => res.send('Frontend not built. Run: npm run build'));
}
app.use((err, _req, res, _next) => { // JSON parse errors etc.
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return bad(res, 'Bad request body.');
  console.error(err); bad(res, 'Server error.', 500);
});

await initStore();
if (!db.rounds.state) { db.rounds.state = newState(); persist('rounds', 'state'); }
app.listen(PORT, () => console.log(`TECHFLIX server on :${PORT}`));
