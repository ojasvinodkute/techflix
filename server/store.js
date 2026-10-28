// Tiny persistence layer. Collections: teams, scores, rounds (doc "state").
// Default: JSON file in DATA_DIR. If FIREBASE_SERVICE_ACCOUNT is set: Firestore (same collection names).
import fs from 'node:fs';
import path from 'node:path';

export const db = { teams: {}, scores: {}, rounds: {} };
let fire = null, file = null, timer = null;

export async function initStore() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const admin = (await import('firebase-admin')).default;
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    fire = admin.firestore();
    fire.settings({ ignoreUndefinedProperties: true });
    for (const col of Object.keys(db)) (await fire.collection(col).get()).forEach((d) => { db[col][d.id] = d.data(); });
    console.log('[store] Firestore connected');
  } else {
    const dir = process.env.DATA_DIR || path.resolve('data');
    fs.mkdirSync(dir, { recursive: true });
    file = path.join(dir, 'techflix-data.json');
    if (fs.existsSync(file)) Object.assign(db, JSON.parse(fs.readFileSync(file, 'utf8')));
    console.log('[store] JSON file at', file, '(ephemeral on Render free tier!)');
  }
}

function flush() {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, file);
}

export function persist(col, id) {
  if (fire) { fire.collection(col).doc(id).set(db[col][id]).catch((e) => console.error('[store] write failed', col, id, e.message)); return; }
  clearTimeout(timer);
  timer = setTimeout(flush, 200);
}

export async function wipe(col) {
  const ids = Object.keys(db[col]);
  db[col] = {};
  if (fire) await Promise.all(ids.map((id) => fire.collection(col).doc(id).delete()));
  else flush();
}
