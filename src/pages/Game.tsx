import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnswerRes, api, Current } from '../api';
import { ErrorBox } from '../ui';

function Ring({ ms, total }: { ms: number; total: number }) {
  const r = 42, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, ms / total));
  const low = ms < 10000;
  return (
    <div className={`relative h-24 w-24 shrink-0 ${low && total > 10000 ? 'animate-glow' : ''}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a855f7" /><stop offset="1" stopColor="#38bdf8" /></linearGradient></defs>
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,.08)" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r={r} stroke={low && total > 10000 ? '#f43f5e' : 'url(#ring)'} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-black text-white">{Math.max(0, Math.ceil(ms / 1000))}</span>
    </div>
  );
}

export default function Game() {
  const round = Number(useParams().round);
  const nav = useNavigate();
  const [cur, setCur] = useState<Current | null>(null);
  const [fb, setFb] = useState<(AnswerRes & { choice: number | null }) | null>(null);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const busy = useRef(false);
  const starting = useRef(false);
  const lastTry = useRef(0);

  const load = useCallback(async () => {
    try {
      let d = await api<Current>(`/api/play/current?round=${round}`, { role: 'team' });
      if (d.attempt === 'none' && d.roundStatus === 'live' && d.active && !starting.current) {
        starting.current = true;
        try { await api('/api/play/start', { method: 'POST', body: { round }, role: 'team' }); } finally { starting.current = false; }
        d = await api<Current>(`/api/play/current?round=${round}`, { role: 'team' });
      }
      offset.current = d.serverNow - Date.now();
      setCur(d); setErr('');
    } catch (e) {
      const x = e as { status?: number; message: string };
      if (x.status === 401) nav('/login', { replace: true });
      else setErr(x.message);
    }
  }, [round, nav]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { // keep in sync with organizer actions (pause/resume/end)
    const id = setInterval(() => { if (!busy.current) load(); }, 2000);
    return () => clearInterval(id);
  }, [load]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(id); }, []);

  const serverNow = now + offset.current;
  const left = cur?.phaseEndsAt ? cur.phaseEndsAt - serverNow : 0;

  const submit = useCallback(async (choice: number | null) => {
    if (busy.current || !cur?.question) return;
    busy.current = true;
    try {
      const r = await api<AnswerRes>('/api/play/answer', { method: 'POST', role: 'team', body: { round, qid: cur.question.id, choice } });
      setFb({ ...r, choice });
      setTimeout(() => { setFb(null); busy.current = false; load(); }, 1500);
    } catch (e) {
      const x = e as { status?: number; message: string };
      busy.current = false;
      if (x.status !== 400) setErr(x.message);
      load();
    }
  }, [cur, round, load]);

  // auto-advance when a phase timer runs out (retry every 600ms, covers clock skew)
  useEffect(() => {
    if (!cur || fb || cur.attempt !== 'inprogress' || cur.roundStatus !== 'live' || !cur.phase || left > 0) return;
    if (Date.now() - lastTry.current < 600) return;
    lastTry.current = Date.now();
    if (cur.phase === 'answer') submit(null); else load();
  }, [left, cur, fb, submit, load, now]);

  // keyboard: 1-4 / A-D
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (cur?.phase !== 'answer' || fb) return;
      const i = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (i >= 0 && cur.question && i < cur.question.options.length) submit(i);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [cur, fb, submit]);

  if (!cur) return <div className="text-center text-slate-400">{err ? <ErrorBox msg={err} /> : 'Connecting to the arena…'}</div>;

  const total = cur.total ?? 0;
  const head = (
    <div className="mb-5 flex items-center justify-between gap-3">
      <Link to="/play" className="text-sky-300 hover:underline">← Dashboard</Link>
      <div className="text-center">
        <div className="font-display text-xs tracking-[.3em] text-violet-300">ROUND 0{round}</div>
        <div className="font-display text-lg font-bold text-white">{cur.name}</div>
      </div>
      <div className="card px-4 py-1.5 text-center"><span className="font-display text-xs text-slate-400">SCORE </span><span className="font-display text-xl font-black text-sky-300">{fb ? fb.score : cur.score ?? 0}</span></div>
    </div>
  );
  const msg = (title: string, body: string, extra?: React.ReactNode) => (
    <div className="mx-auto max-w-xl">{head}<div className="card animate-pop space-y-3 py-10 text-center"><h2 className="neon text-2xl font-black text-white">{title}</h2><p className="text-slate-400">{body}</p>{extra}</div></div>
  );

  if (cur.attempt === 'none') {
    if (cur.roundStatus === 'live' && cur.active) return msg('STARTING…', 'Loading your questions.');
    if (cur.roundStatus === 'ended') return msg('ROUND ENDED', 'This round is over and you did not take part.');
    return msg('STAND BY', 'The organizers have not started this round yet. This page will begin automatically.');
  }
  if (cur.attempt === 'done') {
    return msg('ROUND COMPLETE', `You answered ${cur.answered} of ${total} questions and scored ${cur.score} points.`,
      <Link to="/play" className="btn btn-primary mt-2">Back to dashboard</Link>);
  }
  if (cur.roundStatus === 'paused') return msg('⏸ PAUSED', 'The organizers paused the round. Your timer is frozen — it resumes automatically.');
  if (cur.roundStatus !== 'live') return msg('ROUND CLOSED', 'The organizers closed this round.');

  const qNo = (cur.index ?? 0) + 1;
  const progress = (
    <div className="mb-4 flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (cur.index ?? 0) ? 'bg-sky-400' : i === (cur.index ?? 0) ? 'bg-violet-400 animate-glow' : 'bg-white/10'}`} />
      ))}
    </div>
  );

  if (cur.phase === 'ready' && !fb) {
    return <div className="mx-auto max-w-2xl">{head}{progress}<div className="card py-14 text-center"><div className="font-display text-xs tracking-[.4em] text-violet-300">QUESTION {qNo} / {total}</div><div className="neon mt-3 animate-glow font-display text-4xl font-black text-white">GET READY</div></div></div>;
  }

  if (cur.phase === 'memorize' && cur.memorize) {
    return (
      <div className="mx-auto max-w-2xl">{head}{progress}
        <div className="card animate-pop border-sky-400/60 text-center">
          <div className="font-display text-xs tracking-[.4em] text-sky-300">MEMORIZE · {cur.memorize.title}</div>
          <pre className="my-6 whitespace-pre-wrap rounded-xl border border-violet-500/30 bg-black/60 p-6 text-left font-mono text-xl leading-relaxed text-emerald-300 shadow-[inset_0_0_30px_rgba(139,92,246,.25)] sm:text-2xl">{cur.memorize.lines.join('\n')}</pre>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-sky-400 to-violet-500" style={{ width: `${Math.max(0, Math.min(100, (left / (cur.phaseMs || 5000)) * 100))}%` }} /></div>
          <div className="mt-2 font-display text-sm text-slate-400">It disappears in {Math.max(0, Math.ceil(left / 1000))}s</div>
        </div>
      </div>
    );
  }

  const q = cur.question;
  if (!q) return msg('SYNCING…', 'Hang on a moment.');
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <div className="mx-auto max-w-3xl">{head}{progress}{err && <ErrorBox msg={err} />}
      <div className="card relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xs tracking-[.3em] text-violet-300">QUESTION {qNo} / {total}</div>
            <h2 className="mt-2 font-body text-2xl font-bold leading-snug text-white">{q.text}</h2>
          </div>
          <Ring ms={fb ? 0 : left} total={cur.phaseMs || 30000} />
        </div>
        {q.code && <pre className="overflow-x-auto rounded-xl border border-violet-500/30 bg-black/60 p-4 font-mono text-base text-sky-200">{q.code}</pre>}
        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((o, i) => {
            let cls = 'border-violet-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_-6px_rgba(56,189,248,.9)]';
            if (fb) {
              if (i === fb.correctIndex) cls = 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_24px_-6px_rgba(52,211,153,.9)]';
              else if (i === fb.choice) cls = 'border-rose-500 bg-rose-500/10 animate-shake';
              else cls = 'border-white/10 opacity-40';
            }
            return (
              <button key={i} disabled={!!fb} onClick={() => submit(i)} className={`flex items-center gap-3 rounded-xl border bg-black/30 px-4 py-3 text-left transition active:scale-[.98] ${cls}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 font-display text-sm font-bold text-violet-200">{letters[i]}</span>
                <span className="font-mono text-lg text-white">{o}</span>
              </button>
            );
          })}
        </div>
        {fb && (
          <div className={`animate-pop text-center font-display text-xl font-black ${fb.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
            {fb.timedOut ? "⏱ TIME'S UP" : fb.correct ? '✔ CORRECT  +10' : '✖ WRONG'}
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-slate-500">Tip: press 1–4 or A–D to answer.</p>
    </div>
  );
}
