// End-to-end API test. Usage: BASE=http://localhost:3111 ADMIN_PASSWORD=testpw node test/api-test.mjs
import { QUESTIONS } from '../server/questions.js';
const BASE = process.env.BASE || 'http://localhost:3111';
const PW = process.env.ADMIN_PASSWORD || 'testpw';
let pass = 0, failed = 0;
const ok = (c, msg) => { c ? pass++ : failed++; console.log((c ? 'PASS ' : 'FAIL ') + msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(method, path, body, token) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, data: ct.includes('json') ? await r.json() : await r.text() };
}
const find = (round, id) => QUESTIONS[round].find((q) => q.id === id);

// play a round as a team. wrongOn = set of question indexes (0-based in served order) to answer wrongly
async function playRound(token, round, { wrongOn = new Set(), timeoutOn = new Set() } = {}) {
  await call('POST', '/api/play/start', { round }, token);
  let served = 0, last;
  for (let guard = 0; guard < 200; guard++) {
    const { data: c } = await call('GET', `/api/play/current?round=${round}`, null, token);
    if (c.attempt === 'done') return { c, last };
    if (c.phase === 'memorize') { ok(!c.question, `R${round}: question hidden during memorize`); await sleep(Math.max(100, c.phaseEndsAt - c.serverNow + 150)); continue; }
    if (c.phase === 'ready') { await sleep(Math.max(100, c.phaseEndsAt - c.serverNow + 100)); continue; }
    if (c.phase === 'answer') {
      const q = find(round, c.question.id);
      ok(!('answer' in c.question) && !('correct' in c.question), `R${round}: no answer leaked in payload`);
      const correctIdx = c.question.options.indexOf(q.options[q.answer]);
      if (timeoutOn.has(served)) {
        const early = await call('POST', '/api/play/answer', { round, qid: c.question.id, choice: null }, token);
        ok(early.status === 400, 'timeout rejected when sent too early');
        await sleep(c.phaseEndsAt - c.serverNow + 300);
        last = await call('POST', '/api/play/answer', { round, qid: c.question.id, choice: null }, token);
      } else {
        const choice = wrongOn.has(served) ? (correctIdx + 1) % 4 : correctIdx;
        last = await call('POST', '/api/play/answer', { round, qid: c.question.id, choice }, token);
        const dup = await call('POST', '/api/play/answer', { round, qid: c.question.id, choice: correctIdx }, token);
        ok(dup.status === 409, `R${round}: duplicate submission rejected`);
      }
      served++;
      await sleep(200);
    } else { await sleep(300); }
  }
  throw new Error('round did not finish');
}

// ---- registration ----
const rA = await call('POST', '/api/register', { teamName: 'Alpha Squad', leaderName: 'Asha', email: 'asha@test.com', members: ['B', 'C'] });
const rB = await call('POST', '/api/register', { teamName: 'Beta Crew', leaderName: 'Bhavin', email: 'bhavin@test.com' });
ok(rA.status === 201 && rB.status === 201 && rA.data.teamId !== rB.data.teamId, 'two teams register with different IDs');
ok((await call('POST', '/api/register', { teamName: 'alpha  squad', leaderName: 'X Y', email: 'new@test.com' })).status === 409, 'duplicate team name blocked (case/space-insensitive)');
ok((await call('POST', '/api/register', { teamName: 'Gamma', leaderName: 'X Y', email: 'ASHA@test.com' })).status === 409, 'duplicate email blocked');
ok((await call('POST', '/api/register', { teamName: 'G', leaderName: '', email: 'bad' })).status === 400, 'invalid input rejected');
const tA = await call('POST', '/api/login', { email: 'asha@test.com', accessCode: rA.data.accessCode });
const tB = await call('POST', '/api/login', { email: 'bhavin@test.com', accessCode: rB.data.accessCode.toLowerCase() });
ok(tA.status === 200 && tB.status === 200, 'both teams log in (code case-insensitive)');
ok((await call('POST', '/api/login', { email: 'asha@test.com', accessCode: 'WRONG1' })).status === 401, 'wrong access code rejected');
const A = tA.data.token, B = tB.data.token;

// ---- authorization ----
ok((await call('GET', '/api/admin/overview')).status === 401, 'admin overview needs a token');
ok((await call('GET', '/api/admin/overview', null, A)).status === 401, 'team token cannot use admin API');
ok((await call('POST', '/api/admin/round', { action: 'start', round: 1 }, A)).status === 401, 'team cannot control rounds');
ok((await call('POST', '/api/admin/login', { username: 'admin', password: 'nope' })).status === 401, 'wrong organizer password rejected');
const adm = await call('POST', '/api/admin/login', { username: 'admin', password: PW });
ok(adm.status === 200, 'organizer logs in');
const ADM = adm.data.token;
let ov = await call('GET', '/api/admin/overview', null, ADM);
ok(ov.data.teams.length === 2, 'organizer dashboard lists both registered teams');

// ---- round gating ----
ok((await call('POST', '/api/play/start', { round: 1 }, A)).status === 409, 'cannot start a round before organizer starts it');
ok((await call('POST', '/api/admin/round', { action: 'start', round: 1 }, ADM)).status === 409, 'cannot start without selecting');
ok((await call('POST', '/api/admin/round', { action: 'select', round: 1 }, ADM)).status === 200, 'organizer selects round 1');
ok((await call('POST', '/api/admin/round', { action: 'start', round: 1 }, ADM)).status === 200, 'organizer starts round 1');

// ---- round 1 (A perfect = 30, B misses Q2 = 20) + pause test ----
const pA = playRound(A, 1);
const pB = playRound(B, 1, { wrongOn: new Set([1]) });
await sleep(2500);
await call('POST', '/api/admin/round', { action: 'pause', round: 1 }, ADM);
const { data: cp } = await call('GET', '/api/play/current?round=1', null, A);
ok(cp.roundStatus === 'paused' && !cp.question && !cp.memorize, 'paused round shows no question to teams');
await sleep(1500);
await call('POST', '/api/admin/round', { action: 'resume', round: 1 }, ADM);
await Promise.all([pA, pB]);
ov = await call('GET', '/api/admin/overview', null, ADM);
const sc = Object.fromEntries(ov.data.teams.map((t) => [t.name, t.rounds[1]?.score]));
ok(sc['Alpha Squad'] === 30 && sc['Beta Crew'] === 20, `server scored round 1 correctly (A=${sc['Alpha Squad']}, B=${sc['Beta Crew']})`);
ok((await call('POST', '/api/play/start', { round: 1 }, A)).data.existing === true, 're-start does not reset an attempt');
await call('POST', '/api/admin/round', { action: 'end', round: 1 }, ADM);

// ---- round 2 (B times out on Q1) ----
await call('POST', '/api/admin/round', { action: 'select', round: 2 }, ADM);
await call('POST', '/api/admin/round', { action: 'start', round: 2 }, ADM);
const q2 = await Promise.all([playRound(A, 2), playRound(B, 2, { timeoutOn: new Set([0]) })]);
ok(q2[1].last.data.done === true, 'round 2 finished for B');
ov = await call('GET', '/api/admin/overview', null, ADM);
const r2 = Object.fromEntries(ov.data.teams.map((t) => [t.name, t.rounds[2]?.score]));
ok(r2['Alpha Squad'] === 50 && r2['Beta Crew'] === 40, `timeout scored 0 (A=${r2['Alpha Squad']}, B=${r2['Beta Crew']})`);

// ---- leaderboard visibility ----
ok((await call('GET', '/api/leaderboard')).data.visible === false, 'leaderboard hidden by default');
await call('POST', '/api/admin/leaderboard', { visible: true }, ADM);
const lb = await call('GET', '/api/leaderboard');
ok(lb.data.visible && lb.data.rows[0].name === 'Alpha Squad' && lb.data.rows[0].total === 80 && !('email' in lb.data.rows[0]), 'leaderboard visible after reveal, ranked, no private fields');
await call('POST', '/api/admin/leaderboard', { visible: false }, ADM);
ok((await call('GET', '/api/leaderboard')).data.visible === false, 'leaderboard hides again');

// ---- team privacy + CSV ----
const me = await call('GET', '/api/me', null, A);
ok(me.data.team.name === 'Alpha Squad' && me.data.total === 80, 'team dashboard shows own score');
const csv = await fetch(BASE + '/api/admin/export.csv', { headers: { Authorization: 'Bearer ' + ADM } }).then((r) => r.text());
ok(csv.includes('Alpha Squad') && csv.includes('Beta Crew'), 'CSV export contains both teams');
// ---- round 3 (memory + logic): A perfect, B wrong on 2 ----
await call('POST', '/api/admin/round', { action: 'end', round: 2 }, ADM);
await call('POST', '/api/admin/round', { action: 'select', round: 3 }, ADM);
await call('POST', '/api/admin/round', { action: 'start', round: 3 }, ADM);
await Promise.all([playRound(A, 3), playRound(B, 3, { wrongOn: new Set([0, 3]) })]);
ov = await call('GET', '/api/admin/overview', null, ADM);
const tot = Object.fromEntries(ov.data.teams.map((t) => [t.name, t.total]));
ok(tot['Alpha Squad'] === 130 && tot['Beta Crew'] === 20 + 40 + 30, `round 3 + totals correct (A=${tot['Alpha Squad']}, B=${tot['Beta Crew']})`);
await call('POST', '/api/admin/round', { action: 'end', round: 3 }, ADM);
const spa = await fetch(BASE + '/play/2'); const html = await spa.text();
ok(spa.status === 200 && html.includes('<div id="root">'), 'SPA fallback serves index.html');
console.log(`\n${pass} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
